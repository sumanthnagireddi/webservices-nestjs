import { BlogSchema } from './blog.schema';

describe('BlogSchema', () => {
  it('should be defined', () => {
    expect(BlogSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = BlogSchema.obj;
    expect(schemaObj).toHaveProperty('title');
    expect(schemaObj).toHaveProperty('content');
  });
});
