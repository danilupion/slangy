import { ClientErrorStatusCode, ServerErrorStatusCode } from '@slangy/common/http/statusCode.js';

type MappedValidationError = { [key: string]: string[] };

type ErrorStatusCode = ClientErrorStatusCode | ServerErrorStatusCode;

type MetaType<T> = T extends never ? undefined : T;

const ERROR_MESSAGES: { [key in ErrorStatusCode]: string } = {
  [ClientErrorStatusCode.ClientErrorBadRequest]: 'Bad Request',
  [ClientErrorStatusCode.ClientErrorUnauthorized]: 'Unauthorized',
  [ClientErrorStatusCode.ClientErrorPaymentRequired]: 'Payment Required',
  [ClientErrorStatusCode.ClientErrorForbidden]: 'Forbidden',
  [ClientErrorStatusCode.ClientErrorNotFound]: 'Not Found',
  [ClientErrorStatusCode.ClientErrorMethodNotAllowed]: 'Method Not Allowed',
  [ClientErrorStatusCode.ClientErrorConflict]: 'Conflict',
  [ClientErrorStatusCode.ClientErrorUnsupportedMediaType]: 'Unsupported Media Type',
  [ServerErrorStatusCode.ServerErrorInternalServerError]: 'Internal Server Error',
  [ServerErrorStatusCode.ServerErrorNotImplemented]: 'Not Implemented',
};

export abstract class BaseHttpException<Meta = never> extends Error {
  protected metaValue: MetaType<Meta> | undefined;

  protected constructor(
    public readonly statusCode: ErrorStatusCode,
    public readonly message: string,
    meta?: MetaType<Meta>,
  ) {
    super(message);
    if (meta) {
      this.metaValue = meta;
    }
  }

  public get meta(): MetaType<Meta> {
    return this.metaValue as MetaType<Meta>;
  }
}

interface HttpExceptionInstance<T = never> {
  get meta(): MetaType<T>;
  readonly statusCode: number;
  readonly message: string;
}

export interface HttpException<T = never> {
  new (_meta?: MetaType<T>): HttpExceptionInstance<T>;
}

const generateHttpStatusCodeError = <Meta = never>(
  statusCode: ErrorStatusCode,
): HttpException<Meta> =>
  class StatusCodeError<T = Meta> extends BaseHttpException<T> {
    constructor(meta?: MetaType<T>) {
      super(statusCode, ERROR_MESSAGES[statusCode], meta);
    }
  };

export const ClientErrorBadRequest = generateHttpStatusCodeError<MappedValidationError>(
  ClientErrorStatusCode.ClientErrorBadRequest,
);

export const ClientErrorUnauthorized = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorUnauthorized,
);

export const ClientErrorPaymentRequired = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorPaymentRequired,
);

export const ClientErrorForbidden = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorForbidden,
);

export const ClientErrorNotFound = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorNotFound,
);

export const ClientErrorMethodNotAllowed = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorMethodNotAllowed,
);

export const ClientErrorConflict = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorConflict,
);

export const ClientErrorUnsupportedMediaType = generateHttpStatusCodeError(
  ClientErrorStatusCode.ClientErrorUnsupportedMediaType,
);

export const ServerErrorInternalServerError = generateHttpStatusCodeError<Error | undefined>(
  ServerErrorStatusCode.ServerErrorInternalServerError,
);

export const ServerErrorNotImplemented = generateHttpStatusCodeError(
  ServerErrorStatusCode.ServerErrorNotImplemented,
);
