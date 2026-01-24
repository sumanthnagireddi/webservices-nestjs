import { Test, TestingModule } from '@nestjs/testing';
import { TechnologyService } from './technologies.service';
import { getModelToken } from '@nestjs/mongoose';
import { Technology } from './technologies.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('TechnologyService', () => {
  let service: TechnologyService;

  const mockTechnology = {
    _id: '64f1a1c2a12b3c001a000005',
    name: 'Node.js',
    description: 'JavaScript runtime',
    createdBy: new Types.ObjectId('64f1a1c2a12b3c001a000001'),
    createdAt: new Date(),
  };

  const mockTechnologyModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockTechnology]),
    }),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnologyService,
        {
          provide: getModelToken(Technology.name),
          useValue: mockTechnologyModel,
        },
      ],
    }).compile();

    service = module.get<TechnologyService>(TechnologyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new technology', async () => {
      const createDto = {
        name: 'React',
        description: 'UI Library',
      };

      mockTechnologyModel.findOne.mockResolvedValue(null);
      mockTechnologyModel.create.mockResolvedValue({ ...createDto, _id: '123' });

      const result = await service.create(createDto, '64f1a1c2a12b3c001a000001');

      expect(mockTechnologyModel.findOne).toHaveBeenCalledWith({ name: createDto.name });
      expect(mockTechnologyModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if technology already exists', async () => {
      const createDto = {
        name: 'Node.js',
        description: 'JavaScript runtime',
      };

      mockTechnologyModel.findOne.mockResolvedValue(mockTechnology);

      await expect(service.create(createDto, '64f1a1c2a12b3c001a000001')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllPublic', () => {
    it('should return all technologies sorted by createdAt', async () => {
      const technologies = [mockTechnology];
      mockTechnologyModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(technologies),
      });

      const result = await service.findAllPublic();

      expect(mockTechnologyModel.find).toHaveBeenCalled();
      expect(result).toEqual(technologies);
    });
  });

  describe('findByUser', () => {
    it('should return technologies created by a specific user', async () => {
      const technologies = [mockTechnology];
      mockTechnologyModel.find.mockResolvedValue(technologies);

      const result = await service.findByUser('64f1a1c2a12b3c001a000001');

      expect(mockTechnologyModel.find).toHaveBeenCalledWith({
        createdBy: new Types.ObjectId('64f1a1c2a12b3c001a000001'),
      });
      expect(result).toEqual(technologies);
    });
  });

  describe('update', () => {
    it('should update a technology', async () => {
      const updateDto = {
        name: 'Node.js Updated',
        description: 'Updated description',
      };

      mockTechnologyModel.findByIdAndUpdate.mockResolvedValue({ ...mockTechnology, ...updateDto });

      const result = await service.update('64f1a1c2a12b3c001a000005', updateDto);

      expect(mockTechnologyModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64f1a1c2a12b3c001a000005',
        updateDto,
        { new: true },
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if technology not found', async () => {
      const updateDto = {
        name: 'Updated',
        description: 'Updated',
      };

      mockTechnologyModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a technology', async () => {
      mockTechnologyModel.findByIdAndDelete.mockResolvedValue(mockTechnology);

      await service.delete('64f1a1c2a12b3c001a000005');

      expect(mockTechnologyModel.findByIdAndDelete).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
    });

    it('should throw NotFoundException if technology not found', async () => {
      mockTechnologyModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
