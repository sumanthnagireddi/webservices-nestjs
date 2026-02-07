import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from './test.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test as TestSchema } from './test.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('TestService', () => {
  let service: TestService;

  const mockTest = {
    _id: '64f1a1c2a12b3c001a000005',
    name: 'Test Technology',
    description: 'Test Description',
    createdBy: new Types.ObjectId('64f1a1c2a12b3c001a000001'),
    createdAt: new Date(),
  };

  const mockTestModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockTest]),
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        {
          provide: getModelToken(TestSchema.name),
          useValue: mockTestModel,
        },
      ],
    }).compile();

    service = module.get<TestService>(TestService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new test entity', async () => {
      const createDto = {
        name: 'New Test',
        description: 'New Description',
      };

      mockTestModel.findOne.mockResolvedValue(null);
      mockTestModel.create.mockResolvedValue({ ...createDto, _id: '123' });

      const result = await service.create(createDto, '64f1a1c2a12b3c001a000001');

      expect(mockTestModel.findOne).toHaveBeenCalledWith({ name: createDto.name });
      expect(mockTestModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if test entity already exists', async () => {
      const createDto = {
        name: 'Existing Test',
        description: 'Existing Description',
      };

      mockTestModel.findOne.mockResolvedValue(mockTest);

      await expect(service.create(createDto, '64f1a1c2a12b3c001a000001')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllPublic', () => {
    it('should return all test entities sorted by createdAt', async () => {
      const tests = [mockTest];
      mockTestModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(tests),
      });

      const result = await service.findAllPublic();

      expect(mockTestModel.find).toHaveBeenCalled();
      expect(result).toEqual(tests);
    });
  });

  describe('findByUser', () => {
    it('should return test entities created by a specific user', async () => {
      const tests = [mockTest];
      mockTestModel.find.mockResolvedValue(tests);

      const result = await service.findByUser('64f1a1c2a12b3c001a000001');

      expect(mockTestModel.find).toHaveBeenCalledWith({
        createdBy: new Types.ObjectId('64f1a1c2a12b3c001a000001'),
      });
      expect(result).toEqual(tests);
    });
  });

  describe('findById', () => {
    it('should return a test entity by ID', async () => {
      mockTestModel.findById.mockResolvedValue(mockTest);

      const result = await service.findById('64f1a1c2a12b3c001a000005');

      expect(mockTestModel.findById).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
      expect(result).toEqual(mockTest);
    });
  });

  describe('update', () => {
    it('should update a test entity', async () => {
      const updateDto = {
        name: 'Updated Test',
        description: 'Updated Description',
      };

      mockTestModel.findByIdAndUpdate.mockResolvedValue({ ...mockTest, ...updateDto });

      const result = await service.update('64f1a1c2a12b3c001a000005', updateDto);

      expect(mockTestModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64f1a1c2a12b3c001a000005',
        updateDto,
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if test entity not found', async () => {
      const updateDto = {
        name: 'Updated',
        description: 'Updated',
      };

      mockTestModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFull', () => {
    it('should perform full update of a test entity', async () => {
      const updateDto = {
        name: 'Full Updated Test',
        description: 'Full Updated Description',
      };

      mockTestModel.findByIdAndUpdate.mockResolvedValue({ ...mockTest, ...updateDto });

      const result = await service.updateFull('64f1a1c2a12b3c001a000005', updateDto);

      expect(mockTestModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64f1a1c2a12b3c001a000005',
        updateDto,
        { new: true, overwrite: true },
      );
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a test entity', async () => {
      mockTestModel.findByIdAndDelete.mockResolvedValue(mockTest);

      await service.delete('64f1a1c2a12b3c001a000005');

      expect(mockTestModel.findByIdAndDelete).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
    });

    it('should throw NotFoundException if test entity not found', async () => {
      mockTestModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
