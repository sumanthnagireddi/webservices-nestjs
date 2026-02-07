import { TechnologySchema } from './technologies.schema';

describe('TechnologySchema', () => {
  it('should be defined', () => {
    expect(TechnologySchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = TechnologySchema.obj;
    expect(schemaObj).toHaveProperty('name');
    expect(schemaObj).toHaveProperty('slug');
  });
});
