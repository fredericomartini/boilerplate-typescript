import { logError } from '@helpers/logger';
import CustomException from '@helpers/error/CustomException';
import { NextFunction, Request, Response } from 'express';

interface ResponseBody {
    success: boolean,
    message: string,
    code: number,
    type?: string,
    extra?: any
}

export const isSQLError = (message: string): Boolean => {
  const sqlError = message.match(
    /(select|insert|delete|update|drop|limit|where)/gi
  );

  if (sqlError && sqlError.length) {
    return true;
  }

  return false;
};

export const parseBodyCustomException = (error: CustomException): ResponseBody => {
  const {
    message,
    code,
    type,
    extra
  } = error;

  const body: ResponseBody = {
    success: false,
    message,
    code,
    type,
    extra
  };

  return body;
};

export const parseBodyError = (error: Error): ResponseBody => {
  let { message } = error;

  const code = 500;

  if (isSQLError(message)) {
    message = 'Database error.';
  }

  const body: ResponseBody = {
    success: false,
    message,
    code
  };

  return body;
};
export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof CustomException) {
    return res.status(error.code).json(parseBodyCustomException(error)).send();
  }

  logError(error);

  // Error instance, não tratado
  if (error instanceof Error) {
    const body = parseBodyError(error);

    return res.status(body.code).json(body).send();
  }

  const code = 500;

  // Erro desconhecido
  return res.status(code).json({ success: false, message: 'Unknown Error.', code }).send();
};

export default errorHandler;
