import { ServerTooManyRequestsError } from '@typeDefs/errors';
import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export const WHITE_LIST = [
  '127.0.0.1',
  '::ffff:127.0.0.1',
  '::1'
];

export const getLimiterOpts = () => ({
  points: Number(process.env.MAX_REQUESTS_PER_SECOND),
  duration: 1
});

export const rateLimiter = new RateLimiterMemory(getLimiterOpts());

export const isWhiteListed = (key: string) => WHITE_LIST.includes(key);

export const rateLimitHandler = async (req: Request, _: Response, next: NextFunction) => {
  try {
    if (isWhiteListed(req.ip)) {
      return next();
    }

    await rateLimiter.consume(req.ip);

    return next();
  } catch (error) {
    //
  }

  return next(new ServerTooManyRequestsError());
};

export default rateLimitHandler;
