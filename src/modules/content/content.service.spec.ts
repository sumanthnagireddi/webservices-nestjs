import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { getModelToken } from '@nestjs/mongoose';
import { Content } from './content.schema';
import { Topics } from '../topics/topics.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

describe('ContentService', () => {
  let service: ContentService;
  let contentModel: Model<Content>;
  let topicModel: Model<Topics>;

  const mockTopic = {
    _id: '64f1a1c2a12b3c001a000004',
    name: 'Test Topic',
    topic_description: 'Test Description',
    technologyId: '64f1a1c2a12b3c001a000005',
  };

  const mockContent = {
    _id: '64f1a1c2a12b3c001a000003',
    title: 'Test Content',
    description: 'Test Description',
    body: 'Test Body',
    topicId: new Types.ObjectId('64f1a1c2a12b3c001a000004'),
    technologyId: '64f1a1c2a12b3c001a000005',
    authorId: '64f1a1c2a12b3c001a000001',
    status: 'draft',
  };

  const mockContentModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  const mockTopicModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    // Create a mock constructor for the model
    const MockContentModel = jest.fn().mockImplementation((data) => data);
    Object.assign(MockContentModel, mockContentModel);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getModelToken(Content.name),
          useValue: Object.assign(jest.fn(), mockContentModel),
        },
        {
          provide: getModelToken(Topics.name),
          useValue: mockTopicModel,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    contentModel = module.get<Model<Content>>(getModelToken(Content.name));
    topicModel = module.get<Model<Topics>>(getModelToken(Topics.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContent', () => {
    it('should create new content', async () => {
      const createDto = {
        topicId: '64f1a1c2a12b3c001a000004',
        body: 'Test Body',
        status: 'draft',
      };

      mockTopicModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTopic),
      });
      mockContentModel.findOne.mockResolvedValue(null);
      mockContentModel.create.mockResolvedValue(mockContent);

      const result = await service.createContent(
        createDto,
        '64f1a1c2a12b3c001a000001',
      );

      expect(topicModel.findById).toHaveBeenCalledWith(createDto.topicId);
      expect(contentModel.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when topic not found', async () => {
      const createDto = {
        topicId: 'nonexistent',
        body: 'Test Body',
        status: 'draft',
      };

      mockTopicModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createContent(createDto, '64f1a1c2a12b3c001a000001'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when content already exists', async () => {
      const createDto = {
        topicId: '64f1a1c2a12b3c001a000004',
        body: 'Test Body',
        status: 'draft',
      };

      mockTopicModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTopic),
      });
      mockContentModel.findOne.mockResolvedValue(mockContent);

      await expect(
        service.createContent(createDto, '64f1a1c2a12b3c001a000001'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getContentByTopicId', () => {
    it('should return content', async () => {
      mockContentModel.findOneAndUpdate.mockResolvedValue(mockContent);

      const result = await service.getContentByTopicId('64f1a1c2a12b3c001a000004');

      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException when content not found', async () => {
      mockContentModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(service.getContentByTopicId('64f1a1c2a12b3c001a000004')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getContents', () => {
    it('should return all contents', async () => {
      const contents = [mockContent];
      mockContentModel.find.mockResolvedValue(contents);

      const result = await service.getContents();

      expect(result).toEqual(contents);
    });
  });

  describe('updateContent', () => {
    it('should update content', async () => {
      const updateData = { body: 'Updated Body' };
      mockContentModel.findOneAndUpdate.mockResolvedValue({...mockContent, ...updateData});

      const result = await service.updateContent('64f1a1c2a12b3c001a000004', updateData);

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when content not found', async () => {
      mockContentModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        service.updateContent('64f1a1c2a12b3c001a000004', { body: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
