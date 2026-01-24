import { Test, TestingModule } from '@nestjs/testing';
import { TechnologyController } from './technologies.controller';
import { TechnologyService } from './technologies.service';

describe('TechnologyController', () => {
  let controller: TechnologyController;
  let service: TechnologyService;

  const mockTechnology = {
    _id: '64f1a1c2a12b3c001a000005',
    name: 'Node.js',
    description: 'JavaScript runtime',
  };

  const mockTechnologyService = {
    create: jest.fn(),
    findAllPublic: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnologyController],
      providers: [
        {
          provide: TechnologyService,
          useValue: mockTechnologyService,
        },
      ],
    }).compile();

    controller = module.get<TechnologyController>(TechnologyController);
    service = module.get<TechnologyService>(TechnologyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a technology', async () => {
      const createDto = {
        name: 'React',
        description: 'UI Library',
      };

      mockTechnologyService.create.mockResolvedValue(mockTechnology);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto, '64f1a1c2a12b3c001a000001');
      expect(result).toEqual(mockTechnology);
    });
  });

  describe('findAllPublic', () => {
    it('should return all technologies', async () => {
      const technologies = [mockTechnology];
      mockTechnologyService.findAllPublic.mockResolvedValue(technologies);

      const result = await controller.findAllPublic();

      expect(service.findAllPublic).toHaveBeenCalled();
      expect(result).toEqual(technologies);
    });
  });

  describe('update', () => {
    it('should update a technology', async () => {
      const updateDto = {
        name: 'Node.js Updated',
        description: 'Updated description',
      };

      mockTechnologyService.update.mockResolvedValue({ ...mockTechnology, ...updateDto });

      const result = await controller.update('64f1a1c2a12b3c001a000005', updateDto);

      expect(service.update).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005', updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a technology', async () => {
      mockTechnologyService.delete.mockResolvedValue(undefined);

      await controller.remove('64f1a1c2a12b3c001a000005');

      expect(service.delete).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
    });
  });
});
