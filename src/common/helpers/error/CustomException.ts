interface ErrorData {
    code?: number,
    message: string,
    type?: string
}

class CustomException extends Error {
    readonly message: string;

    readonly code: number;

    readonly type?: string;

    readonly extra?: any;

    constructor({ code, message, type }: ErrorData, extra?: any) {
      super(message);
      this.code = code || 500;
      this.message = message;
      this.type = type;
      this.extra = extra;
    }
}

export default CustomException;
