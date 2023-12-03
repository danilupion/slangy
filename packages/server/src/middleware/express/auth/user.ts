import { Nullish } from '@slangy/common/types.js';
import { NextFunction, Response } from 'express';
import { Promisable } from 'type-fest/source/promisable.js';

import { RequestMaybeWithFields } from '../../../helpers/express/controller.js';
import { ClientErrorUnauthorized } from '../../../helpers/httpError.js';

import { DefaultRequestJwtUserProperty, defaultRequestJwtUserProperty } from './jwt.js';

const defaultRequestUserProperty = 'user';

type DefaultRequestUserProperty = typeof defaultRequestUserProperty;

export type UserData<User extends object, Key extends string = 'user'> = {
  [key in Key]: User;
};

type UserMiddlewareOptions<
  UserData,
  AuthDataReqField extends string,
  UserDataReqField extends string,
  AuthData,
> = {
  reqAuthField?: AuthDataReqField;
  reqUserField?: UserDataReqField;
  userFactory: (auth: AuthData) => Promisable<Nullish<UserData>>;
  mandatory?: boolean;
};

// TODO reqAuthField is the entry one, we need also output one (eg: jwtUser and user)
const user =
  <
    AuthData,
    UserData,
    AuthDataReqField extends string = DefaultRequestJwtUserProperty,
    UserDataReqField extends string = DefaultRequestUserProperty,
  >({
    reqAuthField = defaultRequestJwtUserProperty as AuthDataReqField,
    reqUserField = defaultRequestUserProperty as UserDataReqField,
    userFactory,
    mandatory = true,
  }: UserMiddlewareOptions<UserData, AuthDataReqField, UserDataReqField, AuthData>) =>
  async (
    req: RequestMaybeWithFields<
      { [key in AuthDataReqField]: AuthData } & { [key in UserDataReqField]: UserData }
    >,
    _res: Response,
    next: NextFunction,
  ) => {
    if (req[reqAuthField]) {
      const user: UserData = (await userFactory(req[reqAuthField] as AuthData)) as UserData;

      if (user) {
        // TODO: review why this is even needed, types seem to be correct
        req[reqUserField] = user as (typeof req)[UserDataReqField];
        return next();
      }
    }

    if (!mandatory) {
      return next();
    }

    throw new ClientErrorUnauthorized();
  };

export default user;
