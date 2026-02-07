import { ResourceSchema } from './resource.schema';

describe('ResourceSchema', () => {
  it('should be defined', () => {
    expect(ResourceSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = ResourceSchema.obj;
    expect(schemaObj).toHaveProperty('name');
  });
});
