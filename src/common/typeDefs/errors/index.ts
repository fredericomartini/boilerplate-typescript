/* eslint-disable max-classes-per-file */
import CustomException from '@helpers/error/CustomException';

export class UnauthorizedError extends CustomException {
  constructor(extra?: any) {
    super({
      message: 'UnauthorizedError',
      code: 401
    }, extra);
  }
}

export class AccessForbiddenError extends CustomException {
  constructor(extra?: any) {
    super({
      message: 'AccessForbiddenError',
      code: 403
    }, extra);
  }
}

export class UnsupportedMediaTypeError extends CustomException {
  constructor(extra?: any) {
    super({
      message: 'UnsupportedMediaTypeError',
      code: 415
    }, extra);
  }
}

export class ServerTooManyRequestsError extends CustomException {
  constructor(extra?: any) {
    super({
      message: 'ServerTooManyRequestsError',
      code: 429
    }, extra);
  }
}
