import CustomException from '@helpers/error/CustomException';

describe('Tests for CustomException', () => {
  test('Should have default error code 500', () => {
    const error = new CustomException({ message: 'my error' });

    expect(error).toHaveProperty('code');
    expect(error.code).toBe(500);
  });

  test('Should have passed message', () => {
    const error = new CustomException({ message: 'my error' });

    expect(error).toHaveProperty('message');
    expect(error.message).toBe('my error');
  });

  test('Should have passed code', () => {
    const error = new CustomException({ message: 'my error', code: 444 });

    expect(error.code).toBe(444);
  });

  test('Should have passed type', () => {
    const error = new CustomException({ message: 'my error', type: 'my type' });

    expect(error.type).toBe('my type');
  });

  test('Should have passed extra info', () => {
    const extra = {
      my_extra: {
        extra: 'other'
      }
    };
    const error = new CustomException({ message: 'my error' }, extra);

    expect(error.extra).toEqual(extra);
  });

  test('Should throw with passed message', () => {
    expect(() => {
      throw new CustomException({
        message: 'my exception'
      });
    }).toThrowError('my exception');
  });
});
