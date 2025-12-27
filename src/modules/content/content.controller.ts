import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDTO } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}
  @Post()
  createContent(@Body() contentPayload: CreateContentDTO) {
    // TEMP: replace with auth userId later
    const userId = '64f1a1c2a12b3c001a000001';
    return this.contentService.createContent(contentPayload, userId);
  }

  @Get(':topicId')
  getContent(@Param('topicId') topicId: string) {
    return this.contentService.getContentByTopicId(topicId);
  }
  
  @Get()
  getAllContents() {
    return this.contentService.getContents();
  }
  @Patch(':topicId')
  updateContent(
    @Param('topicId') topicId: string,
    @Body() updateContent: UpdateContentDto,
  ) {
    return this.contentService.updateContent(topicId, updateContent);
  }
}
