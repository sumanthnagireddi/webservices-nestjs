import { TestSchema } from './test.schema';

describe('TestSchema', () => {
  it('should be defined', () => {
    expect(TestSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = TestSchema.obj;
    expect(schemaObj).toHaveProperty('name');
    expect(schemaObj).toHaveProperty('slug');
  });
});
