import { validate } from 'class-validator';
import { UpdateContentDto } from './update-content.dto';

describe('UpdateContentDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateContentDto();
    dto.body = 'Updated body';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object', async () => {
    const dto = new UpdateContentDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
