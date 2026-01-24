import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateUserDto();
    dto.username = 'testuser';
    dto.email = 'test@example.com';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if username is not provided', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('username');
  });

  it('should fail if email is not provided', async () => {
    const dto = new CreateUserDto();
    dto.username = 'testuser';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if email is invalid', async () => {
    const dto = new CreateUserDto();
    dto.username = 'testuser';
    dto.email = 'invalid-email';
    dto.password = 'Password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if password is not provided', async () => {
    const dto = new CreateUserDto();
    dto.username = 'testuser';
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail if password is too short', async () => {
    const dto = new CreateUserDto();
    dto.username = 'testuser';
    dto.email = 'test@example.com';
    dto.password = 'Short1';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if password is too long', async () => {
    const dto = new CreateUserDto();
    dto.username = 'testuser';
    dto.email = 'test@example.com';
    dto.password = 'A'.repeat(33);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
