import * as httpMocks from 'node-mocks-http';
import * as Limiter from '@middlewares/rateLimitHandler';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ServerTooManyRequestsError } from '@typeDefs/errors';

const {
  getLimiterOpts, rateLimiter, rateLimitHandler, isWhiteListed, WHITE_LIST
} = Limiter;

describe('Should be defined', () => {
  test('MAX_REQUESTS_PER_SECOND', () => {
    const isNumber = Number(process.env.MAX_REQUESTS_PER_SECOND);

    expect(isNumber).toBeDefined();
    expect(isNumber).not.toBeNaN();
  });

  test('WHITE_LISTED should have ["127.0.0.1", "::ffff:127.0.0.1", ""::1" ]', () => {
    expect(WHITE_LIST).toEqual(['127.0.0.1', '::ffff:127.0.0.1', '::1']);
  });
});

describe('getLimiterOpts()', () => {
  test('Should points to be MAX_REQUESTS_PER_SECOND', () => {
    expect(getLimiterOpts()).toEqual({
      points: Number(process.env.MAX_REQUESTS_PER_SECOND),
      duration: expect.any(Number)
    });
  });

  test('Should duration to be 1 second', () => {
    expect(getLimiterOpts()).toEqual({
      points: expect.any(Number),
      duration: 1
    });
  });
});

describe('rateLimiter', () => {
  test('Should be instanceOf RateLimiterMemory', () => {
    expect(rateLimiter).toBeInstanceOf(RateLimiterMemory);
  });

  test('Block duration Should be 1 second', async () => {
    const testKey = 'my-key';

    const response = await rateLimiter.consume(testKey);

    expect(response.msBeforeNext).toBe(1 * 1000);
  });

  test('points Should be MAX_REQUESTS_PER_SECOND', async () => {
    const testKey = 'other-key';
    const { MAX_REQUESTS_PER_SECOND } = process.env;
    const response = await rateLimiter.consume(testKey);

    expect(response.remainingPoints).toBe(Number(MAX_REQUESTS_PER_SECOND) - 1);
  });
});

describe('isWhiteListed()', () => {
  test('Should return true when key is whiteListed', () => {
    const [host] = WHITE_LIST;

    expect(isWhiteListed(host)).toBeTrue();
  });

  test('Should return false when key is NOT whiteListed', () => {
    expect(isWhiteListed('128.0.0.0')).toBeFalse();
    expect(isWhiteListed('localhosts')).toBeFalse();
    expect(isWhiteListed('')).toBeFalse();
  });
});

describe('rateLimitHandler()', () => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();
  const next = jest.fn();

  beforeEach(() => {
    req.ip = (Math.floor(Math.random() * 5).toString());
  });

  test('Should call isWhiteListed() with req.IP', () => {
    req.ip = 'x.x.x.x';
    const spy = jest.spyOn(Limiter, 'isWhiteListed');

    rateLimitHandler(req, res, next);
    expect(spy).toHaveBeenCalledWith('x.x.x.x');
  });

  test('Should use client IP as identifier', () => {
    req.ip = '3.3.3.3';
    jest.spyOn(rateLimiter, 'consume');

    rateLimitHandler(req, res, next);
    expect(rateLimiter.consume).toHaveBeenCalledWith('3.3.3.3');
  });

  describe('When whiteListed', () => {
    const [ip] = WHITE_LIST;

    test('Should call next() without args', async () => {
      req.ip = ip;
      await rateLimitHandler(req, res, next);
      expect(next).toHaveBeenNthCalledWith(1);
    });

    test('Should NOT call rateLimiter.consume()', async () => {
      req.ip = ip;
      const spy = jest.spyOn(rateLimiter, 'consume');

      await rateLimitHandler(req, res, next);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('When rateLimit', () => {
    test('Should call next with ServerTooManyRequestsError', async () => {
      jest.spyOn(rateLimiter, 'consume').mockRejectedValue('');

      await rateLimitHandler(req, res, next);
      expect(next).toHaveBeenNthCalledWith(1, new ServerTooManyRequestsError());
    });
  });

  describe('When NOT rateLimit', () => {
    test('Should call next without args', async () => {
      await rateLimitHandler(req, res, next);
      expect(next).toHaveBeenNthCalledWith(1);
    });
  });
});
