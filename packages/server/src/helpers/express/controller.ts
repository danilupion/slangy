import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Jsonify } from 'type-fest';

export type Request = ExpressRequest;

export type Response<Body = never> = ExpressResponse<Body>;

export type RequestWithFields<
  Fields extends Record<string, unknown>,
  BaseRequest extends Request = Request,
> = BaseRequest & Fields;

export type RequestMaybeWithFields<
  Fields,
  BaseRequest extends Request = Request,
> = RequestWithFields<Partial<Fields>, BaseRequest>;

export type RequestWithLocals<
  Locals extends Record<string, unknown>,
  BaseRequest extends Request = Request,
> = BaseRequest & { locals: Locals };

export type RequestMaybeWithLocals<
  Locals,
  BaseRequest extends Request = Request,
> = RequestWithLocals<Partial<Locals>, BaseRequest>;

export type RequestWithBody<Body, BaseRequest extends Request = Request> = Omit<
  BaseRequest,
  'body'
> & {
  body: Jsonify<Body>;
};

export type RequestMaybeWithBody<Body, BaseRequest extends Request = Request> = RequestWithBody<
  Partial<Body>,
  BaseRequest
>;

export type RequestWithQuery<Query, BaseRequest extends Request = Request> = BaseRequest & {
  query: Jsonify<Query>;
};

export type RequestMaybeWithQuery<Query, BaseRequest extends Request = Request> = RequestWithQuery<
  Partial<Query>,
  BaseRequest
>;

export type RequestWithParams<Params, BaseRequest extends Request = Request> = BaseRequest & {
  params: Jsonify<Params>;
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
