import { validate } from 'class-validator';
import { UpdateTopicDto } from './update-topic.dto';

describe('UpdateTopicDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateTopicDto();
    dto.name = 'Updated Topic';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with empty object', async () => {
    const dto = new UpdateTopicDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
