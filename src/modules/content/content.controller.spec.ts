import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CreateContentDTO } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';

describe('ContentController', () => {
  let controller: ContentController;
  let service: ContentService;

  const mockContentService = {
    createContent: jest.fn(),
    getContentByTopicId: jest.fn(),
    getContents: jest.fn(),
    updateContent: jest.fn(),
  };

  const mockContent = {
    _id: '64f1a1c2a12b3c001a000003',
    title: 'Test Content',
    description: 'Test Description',
    body: 'Test Body',
    topicId: '64f1a1c2a12b3c001a000004',
    technologyId: '64f1a1c2a12b3c001a000005',
    authorId: '64f1a1c2a12b3c001a000001',
    status: 'draft',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    service = module.get<ContentService>(ContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createContent', () => {
    it('should create new content', async () => {
      const createDto: CreateContentDTO = {
        topicId: '64f1a1c2a12b3c001a000004',
        body: 'Test Body',
        status: 'draft',
      };

      mockContentService.createContent.mockResolvedValue(mockContent);

      const result = await controller.createContent(createDto);

      expect(service.createContent).toHaveBeenCalledWith(
        createDto,
        '64f1a1c2a12b3c001a000001',
      );
      expect(result).toEqual(mockContent);
    });

    it('should handle content creation with published status', async () => {
      const createDto: CreateContentDTO = {
        topicId: '64f1a1c2a12b3c001a000004',
        body: 'Published Content',
        status: 'published',
      };

      mockContentService.createContent.mockResolvedValue({
        ...mockContent,
        status: 'published',
      });

      const result = await controller.createContent(createDto);

      expect(result.status).toBe('published');
    });
  });

  describe('getContent', () => {
    it('should return content by topic id', async () => {
      const topicId = '64f1a1c2a12b3c001a000004';
      mockContentService.getContentByTopicId.mockResolvedValue(mockContent);

      const result = await controller.getContent(topicId);

      expect(service.getContentByTopicId).toHaveBeenCalledWith(topicId);
      expect(result).toEqual(mockContent);
    });

    it('should propagate not found error', async () => {
      const topicId = 'nonexistent';
      mockContentService.getContentByTopicId.mockRejectedValue(
        new Error('Content not found'),
      );

      await expect(controller.getContent(topicId)).rejects.toThrow(
        'Content not found',
      );
    });
  });

  describe('getAllContents', () => {
    it('should return all contents', async () => {
      const contents = [mockContent, { ...mockContent, _id: 'another-id' }];
      mockContentService.getContents.mockResolvedValue(contents);

      const result = await controller.getAllContents();

      expect(service.getContents).toHaveBeenCalled();
      expect(result).toEqual(contents);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no contents exist', async () => {
      mockContentService.getContents.mockResolvedValue([]);

      const result = await controller.getAllContents();

      expect(result).toEqual([]);
    });
  });

  describe('updateContent', () => {
    it('should update content', async () => {
      const topicId = '64f1a1c2a12b3c001a000004';
      const updateDto: UpdateContentDto = {
        body: 'Updated Body',
      };
      const updatedContent = { ...mockContent, ...updateDto };

      mockContentService.updateContent.mockResolvedValue(updatedContent);

      const result = await controller.updateContent(topicId, updateDto);

      expect(service.updateContent).toHaveBeenCalledWith(topicId, updateDto);
      expect(result).toEqual(updatedContent);
    });

    it('should handle partial updates', async () => {
      const topicId = '64f1a1c2a12b3c001a000004';
      const partialUpdate: UpdateContentDto = {
        status: 'published',
      };

      mockContentService.updateContent.mockResolvedValue({
        ...mockContent,
        ...partialUpdate,
      });

      const result = await controller.updateContent(topicId, partialUpdate);

      expect(result.status).toBe('published');
    });

    it('should propagate not found error', async () => {
      const topicId = 'nonexistent';
      mockContentService.updateContent.mockRejectedValue(
        new Error('Content not found'),
      );

      await expect(
        controller.updateContent(topicId, { body: 'Test' }),
      ).rejects.toThrow('Content not found');
    });
  });
});
