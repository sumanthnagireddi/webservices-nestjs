import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicsDTO } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('topics')
@Controller('topics')
export class TopicController {
  userId = '64f1a1c2a12b3c001a000001';
  @Inject() private topicService: TopicService
  constructor() { }
  
  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'Topic created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createTopic(@Request() @Body() topicDto: CreateTopicsDTO) {
    return this.topicService.createTopic(topicDto, this.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({ status: 200, description: 'Returns all topics' })
  getAllTopics() {
    return this.topicService.getAllTopics();
  }

  @Get('id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Returns the topic' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  getTopicById(@Param('id') id: string) {
    return this.topicService.getTopicByID(id);
  }
  
  @Get('all/:id')
  @ApiOperation({ summary: 'Get topics by technology ID' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'Returns topics for the technology' })
  getTopicByTechnology(@Param('id') id: string) {
    return this.topicService.getTopicByTechId(id);
  }
  
  // PARTIAL UPDATE (PATCH)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  updatePartial(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Topic deleted successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  remove(@Param('id') id: string) {
    return this.topicService.delete(id);
  }
}
