import config from 'config';
import { NextFunction, Response } from 'express';
import jsonWebToken from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { ExtractJwt, Strategy as JwtStrategy, VerifiedCallback } from 'passport-jwt';

import { RequestWithFields } from '../../../helpers/express/controller.js';
import { ClientErrorForbidden, ClientErrorUnauthorized } from '../../../helpers/httpError.js';

export const defaultRequestJwtUserProperty = 'jwtUser';

export type DefaultRequestJwtUserProperty = typeof defaultRequestJwtUserProperty;

const mandatoryJwtStrategyName = 'turbo-jwt-mandatory';
const optionalJwtStrategyName = 'turbo-jwt-optionnal';
const anonymousStrategyName = 'turbo-anonymous';

export const jwtSecret = config.get<string>('auth.jwt.secret');
const jwtExpiration = config.get<string>('auth.jwt.expiration');

export interface Jwt<UserRole extends string = string> {
  id: string;
  role: UserRole;
}

export type JwtData<
  UserRole extends string = string,
  Key extends string = DefaultRequestJwtUserProperty,
> = {
  [key in Key]: Jwt<UserRole>;
};

const strategyOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const mandatoryVerify = <UserRole extends string = string>(
  payload: Jwt<UserRole>,
  done: VerifiedCallback,
) => {
  if (payload.id && payload.role) {
    return done(null, payload);
  }

  return done(new ClientErrorUnauthorized());
};

const optionalVerify = <UserRole extends string = string>(
  payload: Jwt<UserRole>,
  done: VerifiedCallback,
) => {
  if (payload.id && payload.role) {
    return done(null, payload);
  }

  return done(null);
};

const mandatoryJwtStrategy = new JwtStrategy(strategyOptions, mandatoryVerify);
const optionalJwtStrategy = new JwtStrategy(strategyOptions, optionalVerify);

passport.use(mandatoryJwtStrategyName, mandatoryJwtStrategy);
passport.use(optionalJwtStrategyName, optionalJwtStrategy);
passport.use(anonymousStrategyName, new AnonymousStrategy());

const jwtAuth = ({ requestProperty = defaultRequestJwtUserProperty, mandatory = true } = {}) => {
  return passport.authenticate(
    mandatory ? mandatoryJwtStrategyName : [optionalJwtStrategyName, anonymousStrategyName],
    {
      session: false,
      assignProperty: requestProperty,
    },
  );
};

interface GenerateTokenOptions {
  expiresIn?: string | number;
  secret?: string;
}

export const generateToken = (
  payload: object,
  { expiresIn = jwtExpiration, secret = jwtSecret }: GenerateTokenOptions = {},
): Promise<string> =>
  new Promise((res, rej) => {
    jsonWebToken.sign(
      payload,
      secret,
      {
        expiresIn,
      },
      (err, encoded) => {
        if (err || encoded === undefined) {
          return rej(err);
        }
        return res(encoded);
      },
    );
  });

export const hasRole =
  <UserRole extends string, Key extends string>(
    roles: UserRole[],
    requestProperty: Key = defaultRequestJwtUserProperty as Key,
  ) =>
  (req: RequestWithFields<JwtData<UserRole, Key>>, res: Response, next: NextFunction) => {
    jwtAuth({ requestProperty })(req, res, () => {
      if (!roles.includes(req[requestProperty].role)) {
        throw new ClientErrorForbidden();
      }
      return next();
    });
  };

export default jwtAuth;
