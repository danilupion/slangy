enum StatusCode {
  SuccessOK = 200,
  SuccessCreated = 201,
  SuccessNoContent = 204,
  SuccessPartialContent = 206,
  ClientErrorBadRequest = 400,
  ClientErrorUnauthorized = 401,
  ClientErrorPaymentRequired = 402,
  ClientErrorForbidden = 403,
  ClientErrorNotFound = 404,
  ClientErrorMethodNotAllowed = 405,
  ClientErrorConflict = 409,
  ClientErrorUnsupportedMediaType = 415,
  ServerErrorInternalServerError = 500,
  ServerErrorNotImplemented = 501,
}

export default StatusCode;
