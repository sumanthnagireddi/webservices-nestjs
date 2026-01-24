import { validate } from 'class-validator';
import { CreateTechnologyDto } from './create-technology.dto';

describe('CreateTechnologyDto (technolgoies copy)', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateTechnologyDto();
    dto.name = 'Test Technology';
    dto.slug = 'test-technology';
    dto.description = 'Test Description';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if name is not provided', async () => {
    const dto = new CreateTechnologyDto();
    dto.slug = 'test-technology';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail if slug is not provided', async () => {
    const dto = new CreateTechnologyDto();
    dto.name = 'Test Technology';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('slug');
  });

  it('should pass validation without optional description', async () => {
    const dto = new CreateTechnologyDto();
    dto.name = 'Test Technology';
    dto.slug = 'test-technology';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
