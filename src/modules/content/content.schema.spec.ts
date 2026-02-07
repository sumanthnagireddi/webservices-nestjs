import { ContentSchema } from './content.schema';

describe('ContentSchema', () => {
  it('should be defined', () => {
    expect(ContentSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = ContentSchema.obj;
    expect(schemaObj).toHaveProperty('title');
    expect(schemaObj).toHaveProperty('body');
  });
});
