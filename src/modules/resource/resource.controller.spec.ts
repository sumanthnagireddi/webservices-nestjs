import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';

describe('ResourceController', () => {
  let controller: ResourceController;
  let service: ResourceService;

  const mockResource = {
    _id: '64f1a1c2a12b3c001a000001',
    name: 'Test Resource',
    url: 'https://example.com',
  };

  const mockResourceService = {
    getAllResources: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        {
          provide: ResourceService,
          useValue: mockResourceService,
        },
      ],
    }).compile();

    controller = module.get<ResourceController>(ResourceController);
    service = module.get<ResourceService>(ResourceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllResources', () => {
    it('should return all resources', async () => {
      const resources = [mockResource];
      mockResourceService.getAllResources.mockResolvedValue(resources);

      const result = await controller.getAllResources();

      expect(service.getAllResources).toHaveBeenCalled();
      expect(result).toEqual(resources);
    });

    it('should return empty array when no resources', async () => {
      mockResourceService.getAllResources.mockResolvedValue([]);

      const result = await controller.getAllResources();

      expect(result).toEqual([]);
    });
  });
});
