import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDTO } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}
  
  @Post()
  @ApiOperation({ summary: 'Create new content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createContent(@Body() contentPayload: CreateContentDTO) {
    // TEMP: replace with auth userId later
    const userId = '64f1a1c2a12b3c001a000001';
    return this.contentService.createContent(contentPayload, userId);
  }

  @Get(':topicId')
  @ApiOperation({ summary: 'Get content by topic ID' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Returns content for the topic' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  getContent(@Param('topicId') topicId: string) {
    return this.contentService.getContentByTopicId(topicId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contents' })
  @ApiResponse({ status: 200, description: 'Returns all contents' })
  getAllContents() {
    return this.contentService.getContents();
  }
  
  @Patch(':topicId')
  @ApiOperation({ summary: 'Update content' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  updateContent(
    @Param('topicId') topicId: string,
    @Body() updateContent: UpdateContentDto,
  ) {
    return this.contentService.updateContent(topicId, updateContent);
  }
}
