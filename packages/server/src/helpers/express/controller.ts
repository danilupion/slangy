import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

export type Request = ExpressRequest;

export type Response<Body = unknown> = ExpressResponse<Body>;

export type RequestWithFields<
  Fields extends object,
  BaseRequest extends Request = Request,
> = BaseRequest & Fields;

export type RequestMaybeWithFields<
  Fields,
  BaseRequest extends Request = Request,
> = RequestWithFields<Partial<Fields>, BaseRequest>;

export type RequestWithBody<Body, BaseRequest extends Request = Request> = Omit<
  BaseRequest,
  'body'
> & {
  body: Body;
};

export type RequestMaybeWithBody<Body, BaseRequest extends Request = Request> = RequestWithBody<
  Partial<Body>,
  BaseRequest
>;

export type RequestWithQuery<Query, BaseRequest extends Request = Request> = BaseRequest & {
  query: Query;
};

export type RequestMaybeWithQuery<Query, BaseRequest extends Request = Request> = RequestWithQuery<
  Partial<Query>,
  BaseRequest
>;

export type RequestWithParams<Params, BaseRequest extends Request = Request> = BaseRequest & {
  params: Params;
};

export type ResponseWithBody<Body> = Response<Body>;

export type Controller<Req extends Request = Request, Res extends Response = Response> = (
  req: Req,
  res: Res,
  next: NextFunction,
) => Promise<void | Res | NextFunction> | void | Res | NextFunction;

export default <Req extends Request = Request, Res extends Response = Response>(
  controller: Controller<Req, Res>,
) => controller;
