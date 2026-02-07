import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { TestService } from './test.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly technologyService: TestService) {}

  // CREATE
  @Post()
  @ApiOperation({ summary: 'Create a new test technology' })
  @ApiResponse({ status: 201, description: 'Test technology created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateTechnologyDto) {
    // TEMP: replace with auth userId later
    const userId = '64f1a1c2a12b3c001a000001';
    return this.technologyService.create(dto, userId);
  }

  // GET ALL (PUBLIC)
  @Get()
  @ApiOperation({ summary: 'Get all test technologies' })
  @ApiResponse({ status: 200, description: 'Returns all test technologies' })
  findAllPublic() {
    return this.technologyService.findAllPublic();
  }

  // ✅ GET BY ID
  @Get(':id')
  @ApiOperation({ summary: 'Get test technology by ID' })
  @ApiParam({ name: 'id', description: 'Test technology ID' })
  @ApiResponse({ status: 200, description: 'Returns the test technology' })
  @ApiResponse({ status: 404, description: 'Test technology not found' })
  findOne(@Param('id') id: string) {
    return this.technologyService.findById(id);
  }

  // ✅ FULL UPDATE (PUT)
  @Put(':id')
  @ApiOperation({ summary: 'Full update of test technology' })
  @ApiParam({ name: 'id', description: 'Test technology ID' })
  @ApiResponse({ status: 200, description: 'Test technology fully updated' })
  @ApiResponse({ status: 404, description: 'Test technology not found' })
  updateFull(@Param('id') id: string, @Body() dto: UpdateTechnologyDto) {
    return this.technologyService.updateFull(id, dto);
  }

  // PARTIAL UPDATE (PATCH)
  @Patch(':id')
  @ApiOperation({ summary: 'Partial update of test technology' })
  @ApiParam({ name: 'id', description: 'Test technology ID' })
  @ApiResponse({ status: 200, description: 'Test technology partially updated' })
  @ApiResponse({ status: 404, description: 'Test technology not found' })
  updatePartial(@Param('id') id: string, @Body() dto: UpdateTechnologyDto) {
    return this.technologyService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test technology' })
  @ApiParam({ name: 'id', description: 'Test technology ID' })
  @ApiResponse({ status: 200, description: 'Test technology deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test technology not found' })
  remove(@Param('id') id: string) {
    return this.technologyService.delete(id);
  }
}
