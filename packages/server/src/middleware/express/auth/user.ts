import { NextFunction, Response } from 'express';

import { RequestMaybeWithFields } from '../../../helpers/express/controller.js';
import { ClientErrorUnauthorized } from '../../../helpers/httpError.js';
import { Nullable } from '../../../types.js';

export type UserData<User extends object, Key extends string = 'user'> = {
  [key in Key]: User;
};

type UserMiddlewareOptions<User, ReqField extends string, AuthData> = {
  reqAuthField: ReqField;
  userFactory: (auth: AuthData) => Promise<Nullable<User>> | Nullable<User>;
  mandatory?: boolean;
};

const user =
  <AuthData, User, ReqField extends string>({
    reqAuthField,
    userFactory,
    mandatory = true,
  }: UserMiddlewareOptions<User, ReqField, AuthData>) =>
  async (
    req: RequestMaybeWithFields<{ [key in ReqField]: AuthData }>,
    _res: Response,
    next: NextFunction,
  ) => {
    if (req[reqAuthField]) {
      const user = await userFactory(req[reqAuthField] as AuthData);

      if (user) {
        req.user = user;
        return next();
      }
    }

    if (!mandatory) {
      return next();
    }

    throw new ClientErrorUnauthorized();
  };

export default user;
