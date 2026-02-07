import { Controller, Get } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { Resource } from './resource.schema';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('resource')
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all resources' })
  @ApiResponse({ status: 200, description: 'Returns all resources', type: [Resource] })
  async getAllResources(): Promise<Resource[]> {
    return this.resourceService.getAllResources();
  }
}
