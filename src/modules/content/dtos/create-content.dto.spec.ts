import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateContentDTO } from './create-content.dto';

describe('CreateContentDTO', () => {
  it('should pass validation with valid data', async () => {
    const plain = {
      title: 'Test Content',
      body: 'Test Body',
      topicId: '64f1a1c2a12b3c001a000004',
      authorId: '64f1a1c2a12b3c001a000001',
      status: 'draft',
    };
    const dto = plainToClass(CreateContentDTO, plain);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if title is not provided', async () => {
    const plain = {
      body: 'Test Body',
      topicId: '64f1a1c2a12b3c001a000004',
      authorId: '64f1a1c2a12b3c001a000001',
    };
    const dto = plainToClass(CreateContentDTO, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should fail if body is not provided', async () => {
    const plain = {
      title: 'Test Content',
      topicId: '64f1a1c2a12b3c001a000004',
      authorId: '64f1a1c2a12b3c001a000001',
    };
    const dto = plainToClass(CreateContentDTO, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('body');
  });

  it('should fail if topicId is invalid', async () => {
    const plain = {
      title: 'Test Content',
      body: 'Test Body',
      topicId: 'invalid-id',
      authorId: '64f1a1c2a12b3c001a000001',
    };
    const dto = plainToClass(CreateContentDTO, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass validation with optional fields', async () => {
    const plain = {
      title: 'Test Content',
      body: 'Test Body',
      topicId: '64f1a1c2a12b3c001a000004',
      authorId: '64f1a1c2a12b3c001a000001',
      technologyId: '64f1a1c2a12b3c001a000005',
      status: 'published',
      publishedAt: new Date(),
    };
    const dto = plainToClass(CreateContentDTO, plain);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if status is invalid', async () => {
    const plain = {
      title: 'Test Content',
      body: 'Test Body',
      topicId: '64f1a1c2a12b3c001a000004',
      authorId: '64f1a1c2a12b3c001a000001',
      status: 'invalid-status',
    };
    const dto = plainToClass(CreateContentDTO, plain);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
