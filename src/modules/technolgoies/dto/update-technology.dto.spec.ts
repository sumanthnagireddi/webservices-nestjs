import { validate } from 'class-validator';
import { UpdateTechnologyDto } from './update-technology.dto';

describe('UpdateTechnologyDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateTechnologyDto();
    dto.name = 'Updated Name';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object', async () => {
    const dto = new UpdateTechnologyDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
