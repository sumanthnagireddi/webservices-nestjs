import { validate } from 'class-validator';
import { CreateTopicsDTO } from './create-topic.dto';

describe('CreateTopicsDTO', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateTopicsDTO();
    dto.technologyId = '64f1a1c2a12b3c001a000005';
    dto.name = 'Test Topic';
    dto.topic_description = 'Test Description';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if technologyId is not provided', async () => {
    const dto = new CreateTopicsDTO();
    dto.name = 'Test Topic';
    dto.topic_description = 'Test Description';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('technologyId');
  });

  it('should fail if name is not provided', async () => {
    const dto = new CreateTopicsDTO();
    dto.technologyId = '64f1a1c2a12b3c001a000005';
    dto.topic_description = 'Test Description';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail if topic_description is not provided', async () => {
    const dto = new CreateTopicsDTO();
    dto.technologyId = '64f1a1c2a12b3c001a000005';
    dto.name = 'Test Topic';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('topic_description');
  });

  it('should fail if name is not a string', async () => {
    const dto = new CreateTopicsDTO();
    dto.technologyId = '64f1a1c2a12b3c001a000005';
    dto.name = 123 as any;
    dto.topic_description = 'Test Description';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
