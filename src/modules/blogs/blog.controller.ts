import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './blog.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /* ---------- Create ---------- */
  @Post()
  @ApiOperation({ summary: 'Create a new blog' })
  @ApiResponse({ status: 201, description: 'Blog created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() body: Partial<Blog>) {
    return this.blogService.create(body);
  }

  /* ---------- Get All ---------- */
  @Get()
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({ status: 200, description: 'Returns all blogs' })
  findAll() {
    return this.blogService.findAll();
  }

  /* ---------- Get By ID ---------- */
  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiParam({ name: 'id', description: 'Blog ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Returns the blog' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  findById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  /* ---------- Get By Slug ---------- */
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get blog by slug' })
  @ApiParam({ name: 'slug', description: 'Blog slug', example: 'my-first-blog' })
  @ApiResponse({ status: 200, description: 'Returns the blog' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  /* ---------- Update ---------- */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog' })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog updated successfully' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  update(@Param('id') id: string, @Body() body: Partial<Blog>) {
    return this.blogService.update(id, body);
  }

  /* ---------- Publish ---------- */
  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a blog' })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog published successfully' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  /* ---------- Delete (Soft) ---------- */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog (soft delete)' })
  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
