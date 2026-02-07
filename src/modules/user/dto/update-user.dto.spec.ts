import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateUserDto();
    dto.username = 'updateduser';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object', async () => {
    const dto = new UpdateUserDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
