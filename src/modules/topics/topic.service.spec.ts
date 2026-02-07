import { Test, TestingModule } from '@nestjs/testing';
import { TopicService } from './topic.service';
import { getModelToken } from '@nestjs/mongoose';
import { Topics } from './topics.schema';
import { Content } from '../content/content.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('TopicService', () => {
  let service: TopicService;

  const mockTopic = {
    _id: '64f1a1c2a12b3c001a000004',
    name: 'Test Topic',
    topic_description: 'Test Description',
    technologyId: '64f1a1c2a12b3c001a000005',
    createdBy: new Types.ObjectId('64f1a1c2a12b3c001a000001'),
    createdAt: new Date(),
  };

  const mockContent = {
    _id: '64f1a1c2a12b3c001a000003',
    title: 'Test Content',
    topicId: new Types.ObjectId('64f1a1c2a12b3c001a000004'),
  };

  const mockTopicModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockTopic]),
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockContentModel = {
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        {
          provide: getModelToken(Topics.name),
          useValue: mockTopicModel,
        },
        {
          provide: getModelToken(Content.name),
          useValue: mockContentModel,
        },
      ],
    }).compile();

    service = module.get<TopicService>(TopicService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTopic', () => {
    it('should create a new topic', async () => {
      const createDto = {
        name: 'New Topic',
        topic_description: 'New Description',
        technologyId: '64f1a1c2a12b3c001a000005',
      };

      mockTopicModel.findOne.mockResolvedValue(null);
      mockTopicModel.create.mockResolvedValue({ ...createDto, _id: '123' });

      const result = await service.createTopic(createDto, '64f1a1c2a12b3c001a000001');

      expect(mockTopicModel.findOne).toHaveBeenCalledWith({ name: createDto.name });
      expect(mockTopicModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if topic already exists', async () => {
      const createDto = {
        name: 'Existing Topic',
        topic_description: 'Description',
        technologyId: '64f1a1c2a12b3c001a000005',
      };

      mockTopicModel.findOne.mockResolvedValue(mockTopic);

      await expect(service.createTopic(createDto, '64f1a1c2a12b3c001a000001')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getAllTopics', () => {
    it('should return all topics sorted by createdAt', async () => {
      const topics = [mockTopic];
      mockTopicModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(topics),
      });

      const result = await service.getAllTopics();

      expect(mockTopicModel.find).toHaveBeenCalled();
      expect(result).toEqual(topics);
    });
  });

  describe('getTopicByID', () => {
    it('should return a topic by ID', async () => {
      mockTopicModel.findById.mockResolvedValue(mockTopic);

      const result = await service.getTopicByID('64f1a1c2a12b3c001a000004');

      expect(mockTopicModel.findById).toHaveBeenCalledWith('64f1a1c2a12b3c001a000004');
      expect(result).toEqual(mockTopic);
    });
  });

  describe('getTopicByTechId', () => {
    it('should return topics by technology ID', async () => {
      const topics = [mockTopic];
      mockTopicModel.find.mockResolvedValue(topics);

      const result = await service.getTopicByTechId('64f1a1c2a12b3c001a000005');

      expect(mockTopicModel.find).toHaveBeenCalledWith({
        technologyId: '64f1a1c2a12b3c001a000005',
      });
      expect(result).toEqual(topics);
    });
  });

  describe('update', () => {
    it('should update a topic and its related content', async () => {
      const updateDto = {
        name: 'Updated Topic',
        topic_description: 'Updated Description',
      };

      mockTopicModel.findByIdAndUpdate.mockResolvedValue({ ...mockTopic, ...updateDto });
      mockContentModel.findOneAndUpdate.mockResolvedValue(mockContent);

      const result = await service.update('64f1a1c2a12b3c001a000004', updateDto);

      expect(mockTopicModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64f1a1c2a12b3c001a000004',
        updateDto,
        { new: true },
      );
      expect(mockContentModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if topic not found', async () => {
      const updateDto = {
        name: 'Updated Topic',
        topic_description: 'Updated Description',
      };

      mockTopicModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('64f1a1c2a12b3c001a000004', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a topic and its related content', async () => {
      mockTopicModel.findByIdAndDelete.mockResolvedValue(mockTopic);
      mockContentModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.delete('64f1a1c2a12b3c001a000004');

      expect(mockTopicModel.findByIdAndDelete).toHaveBeenCalledWith('64f1a1c2a12b3c001a000004');
      expect(mockContentModel.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Topic and related content deleted successfully' });
    });

    it('should throw NotFoundException if topic not found', async () => {
      mockTopicModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete('64f1a1c2a12b3c001a000004')).rejects.toThrow(NotFoundException);
    });
  });
});
