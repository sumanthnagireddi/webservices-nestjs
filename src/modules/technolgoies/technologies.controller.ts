import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
// import { TechnologyService } from './technology.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { TechnologyService } from './technologies.service';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
// import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('technologies')
@Controller('technologies')
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new technology' })
  @ApiResponse({ status: 201, description: 'Technology created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateTechnologyDto) {
    // TEMP: replace with auth userId later
    const userId = '64f1a1c2a12b3c001a000001';
    return this.technologyService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all public technologies' })
  @ApiResponse({ status: 200, description: 'Returns all public technologies' })
  findAllPublic() {
    return this.technologyService.findAllPublic();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a technology' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'Technology updated successfully' })
  @ApiResponse({ status: 404, description: 'Technology not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTechnologyDto) {
    return this.technologyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a technology' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'Technology deleted successfully' })
  @ApiResponse({ status: 404, description: 'Technology not found' })
  remove(@Param('id') id: string) {
    return this.technologyService.delete(id);
  }
}
