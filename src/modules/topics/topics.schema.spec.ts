import { TopicSchema } from './topics.schema';

describe('TopicSchema', () => {
  it('should be defined', () => {
    expect(TopicSchema).toBeDefined();
  });

  it('should have correct schema structure', () => {
    const schemaObj = TopicSchema.obj;
    expect(schemaObj).toHaveProperty('name');
    expect(schemaObj).toHaveProperty('technologyId');
  });
});
