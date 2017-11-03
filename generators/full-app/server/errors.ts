import {STATUS_CODES} from 'http';

export class HttpError extends Error {
  public status: number;
  constructor(m: string|number) {
    let code;
    if (typeof m === 'number') {
      code = m;
      m = STATUS_CODES[m];
    }
    super(m);

    Object.setPrototypeOf(this, HttpError.prototype);
    
    if (code) {
      this.name = m.replace(/ /g, '') + 'Error';
      this.status = code;
    }
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class InvalidArgumentsError extends HttpError {
  constructor(message: string = 'Invalid arguments') {
    super(message);
    this.name = 'InvalidArgumentsError';
    this.status = 400;
  }
}

export class NotAcceptableError extends HttpError {
  constructor(message: string = 'No valid Accept header') {
    super(message);
    this.name = 'NotAcceptableError';
    this.status = 406;
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}
