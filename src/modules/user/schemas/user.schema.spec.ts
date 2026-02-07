import { User, UserSchema } from './user.schema';

describe('UserSchema', () => {
  it('should be defined', () => {
    expect(UserSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = UserSchema.obj;
    expect(schemaObj).toHaveProperty('userName');
    expect(schemaObj).toHaveProperty('email');
    expect(schemaObj).toHaveProperty('password');
  });
});
