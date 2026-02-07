import { Test, TestingModule } from '@nestjs/testing';
import { TestController } from './test.controller';
import { TestService } from './test.service';

describe('TestController', () => {
  let controller: TestController;
  let service: TestService;

  const mockTest = {
    _id: '64f1a1c2a12b3c001a000005',
    name: 'Test Technology',
    description: 'Test Description',
  };

  const mockTestService = {
    create: jest.fn(),
    findAllPublic: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    updateFull: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: TestService,
          useValue: mockTestService,
        },
      ],
    }).compile();

    controller = module.get<TestController>(TestController);
    service = module.get<TestService>(TestService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a test entity', async () => {
      const createDto = {
        name: 'New Test',
        description: 'New Description',
      };

      mockTestService.create.mockResolvedValue(mockTest);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto, '64f1a1c2a12b3c001a000001');
      expect(result).toEqual(mockTest);
    });
  });

  describe('findAllPublic', () => {
    it('should return all test entities', async () => {
      const tests = [mockTest];
      mockTestService.findAllPublic.mockResolvedValue(tests);

      const result = await controller.findAllPublic();

      expect(service.findAllPublic).toHaveBeenCalled();
      expect(result).toEqual(tests);
    });
  });

  describe('findOne', () => {
    it('should return a test entity by ID', async () => {
      mockTestService.findById.mockResolvedValue(mockTest);

      const result = await controller.findOne('64f1a1c2a12b3c001a000005');

      expect(service.findById).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
      expect(result).toEqual(mockTest);
    });
  });

  describe('updateFull', () => {
    it('should perform full update of a test entity', async () => {
      const updateDto = {
        name: 'Full Updated',
        description: 'Full Updated Description',
      };

      mockTestService.updateFull.mockResolvedValue({ ...mockTest, ...updateDto });

      const result = await controller.updateFull('64f1a1c2a12b3c001a000005', updateDto);

      expect(service.updateFull).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005', updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('updatePartial', () => {
    it('should perform partial update of a test entity', async () => {
      const updateDto = {
        name: 'Partial Updated',
      };

      mockTestService.update.mockResolvedValue({ ...mockTest, ...updateDto });

      const result = await controller.updatePartial('64f1a1c2a12b3c001a000005', updateDto);

      expect(service.update).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005', updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a test entity', async () => {
      mockTestService.delete.mockResolvedValue(undefined);

      await controller.remove('64f1a1c2a12b3c001a000005');

      expect(service.delete).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
    });
  });
});
