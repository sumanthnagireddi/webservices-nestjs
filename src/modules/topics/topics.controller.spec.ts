import { Test, TestingModule } from '@nestjs/testing';
import { TopicController } from './topics.controller';
import { TopicService } from './topic.service';

describe('TopicController', () => {
  let controller: TopicController;
  let service: TopicService;

  const mockTopic = {
    _id: '64f1a1c2a12b3c001a000004',
    name: 'Test Topic',
    topic_description: 'Test Description',
    technologyId: '64f1a1c2a12b3c001a000005',
  };

  const mockTopicService = {
    createTopic: jest.fn(),
    getAllTopics: jest.fn(),
    getTopicByID: jest.fn(),
    getTopicByTechId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicController],
      providers: [
        {
          provide: TopicService,
          useValue: mockTopicService,
        },
      ],
    }).compile();

    controller = module.get<TopicController>(TopicController);
    service = module.get<TopicService>(TopicService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTopic', () => {
    it('should create a topic', async () => {
      const createDto = {
        name: 'New Topic',
        topic_description: 'New Description',
        technologyId: '64f1a1c2a12b3c001a000005',
      };

      mockTopicService.createTopic.mockResolvedValue(mockTopic);

      const result = await controller.createTopic(createDto);

      expect(service.createTopic).toHaveBeenCalledWith(createDto, '64f1a1c2a12b3c001a000001');
      expect(result).toEqual(mockTopic);
    });
  });

  describe('getAllTopics', () => {
    it('should return all topics', async () => {
      const topics = [mockTopic];
      mockTopicService.getAllTopics.mockResolvedValue(topics);

      const result = await controller.getAllTopics();

      expect(service.getAllTopics).toHaveBeenCalled();
      expect(result).toEqual(topics);
    });
  });

  describe('getTopicById', () => {
    it('should return a topic by ID', async () => {
      mockTopicService.getTopicByID.mockResolvedValue(mockTopic);

      const result = await controller.getTopicById('64f1a1c2a12b3c001a000004');

      expect(service.getTopicByID).toHaveBeenCalledWith('64f1a1c2a12b3c001a000004');
      expect(result).toEqual(mockTopic);
    });
  });

  describe('getTopicByTechnology', () => {
    it('should return topics by technology ID', async () => {
      const topics = [mockTopic];
      mockTopicService.getTopicByTechId.mockResolvedValue(topics);

      const result = await controller.getTopicByTechnology('64f1a1c2a12b3c001a000005');

      expect(service.getTopicByTechId).toHaveBeenCalledWith('64f1a1c2a12b3c001a000005');
      expect(result).toEqual(topics);
    });
  });

  describe('updatePartial', () => {
    it('should update a topic', async () => {
      const updateDto = {
        name: 'Updated Topic',
        topic_description: 'Updated Description',
      };

      mockTopicService.update.mockResolvedValue({ ...mockTopic, ...updateDto });

      const result = await controller.updatePartial('64f1a1c2a12b3c001a000004', updateDto);

      expect(service.update).toHaveBeenCalledWith('64f1a1c2a12b3c001a000004', updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a topic', async () => {
      const deleteResult = { message: 'Topic and related content deleted successfully' };
      mockTopicService.delete.mockResolvedValue(deleteResult);

      const result = await controller.remove('64f1a1c2a12b3c001a000004');

      expect(service.delete).toHaveBeenCalledWith('64f1a1c2a12b3c001a000004');
      expect(result).toEqual(deleteResult);
    });
  });
});
