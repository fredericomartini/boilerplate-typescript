import { NextFunction, Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { UnauthorizedError } from '@typeDefs/errors';
import { getAccountByToken } from '@modules/Auth/utils';

export const AUTH_HEADER = 'x-api-key';

export const validateToken = (token?: string) => {
  if (!token?.trim()) {
    throw new UnauthorizedError(`Header ${AUTH_HEADER} not found`);
  }
};

export const getToken = (headers: IncomingHttpHeaders) => headers[AUTH_HEADER] as string;

export const validateHeaders = (headers: IncomingHttpHeaders) => {
  validateToken(getToken(headers));
};

export const setAccountToRequest = async (req: Request) => {
  req.account = await getAccountByToken(getToken(req.headers));
};

export const isAuthenticated = async (req: Request, _: Response, next: NextFunction) => {
  try {
    validateHeaders(req.headers);
    await setAccountToRequest(req);
  } catch (error) {
    return next(error);
  }

  next();
};

export default isAuthenticated;
