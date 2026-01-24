import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from './resource.service';
import { getModelToken } from '@nestjs/mongoose';
import { Resource } from './resource.schema';

describe('ResourceService', () => {
  let service: ResourceService;

  const mockResource = {
    _id: '64f1a1c2a12b3c001a000001',
    name: 'Test Resource',
    url: 'https://example.com',
  };

  const mockResourceModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: getModelToken(Resource.name),
          useValue: mockResourceModel,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllResources', () => {
    it('should return all resources', async () => {
      const resources = [mockResource];
      mockResourceModel.find().exec.mockResolvedValue(resources);

      const result = await service.getAllResources();

      expect(mockResourceModel.find).toHaveBeenCalled();
      expect(result).toEqual(resources);
    });

    it('should return empty array when no resources', async () => {
      mockResourceModel.find().exec.mockResolvedValue([]);

      const result = await service.getAllResources();

      expect(result).toEqual([]);
    });
  });
});
