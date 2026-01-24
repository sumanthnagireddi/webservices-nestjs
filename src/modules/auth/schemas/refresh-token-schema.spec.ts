import { RefreshTokenSchema } from './refresh-token-schema';

describe('RefreshTokenSchema', () => {
  it('should be defined', () => {
    expect(RefreshTokenSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = RefreshTokenSchema.obj;
    expect(schemaObj).toHaveProperty('userId');
    expect(schemaObj).toHaveProperty('refreshToken');
  });
});
