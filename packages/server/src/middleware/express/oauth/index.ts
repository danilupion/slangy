import passport, { Profile as PassportProfile, Strategy } from 'passport';

import { ClientErrorUnauthorized } from '../../../helpers/httpError.js';

export type OauthProfile = PassportProfile;

type StrategyFactoryOptions<Profile extends PassportProfile> = {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  profileFields?: (keyof Profile)[];
};

type StrategyFactoryCallback<
  Profile extends PassportProfile,
  User extends Express.User = Express.User,
> = (
  accessToken: string,
  _refreshToken: string,
  profile: Profile,
  done: (err?: Error | null, user?: User) => void,
) => void | Promise<void>;

type OauthMiddlewareOptions<Profile extends PassportProfile> = {
  strategyName: string;
  strategyFactory: (
    options: StrategyFactoryOptions<Profile>,
    callback: StrategyFactoryCallback<Profile>,
  ) => Strategy;
  clientId: string;
  clientSecret: string;
  profileFields?: (keyof Profile)[];
  defaultScope?: string[];
};

type InitializeMiddlewareOptions<Profile extends PassportProfile, User extends Express.User> = {
  callbackURL: string;
  userFromProfile: (profile: Profile) => Promise<User | null | undefined>;
};

export const oauthMiddlewareFactory = <Profile extends PassportProfile>({
  strategyName,
  strategyFactory,
  clientId,
  clientSecret,
  profileFields = [],
  defaultScope = [],
}: OauthMiddlewareOptions<Profile>) => {
  return {
    initialize: <User extends Express.User>({
      callbackURL,
      userFromProfile,
    }: InitializeMiddlewareOptions<Profile, User>) => {
      const strategy = strategyFactory(
        {
          clientID: clientId,
          clientSecret: clientSecret,
          callbackURL,
          profileFields,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await userFromProfile(profile);

            if (!user) {
              return done(new ClientErrorUnauthorized() as unknown as Error);
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        },
      );

      passport.use(strategyName, strategy);
    },
    initiator: ({ scope = defaultScope } = {}) => {
      return passport.authenticate(strategyName, { scope });
    },
    callback: ({ session = false } = {}) => passport.authenticate(strategyName, { session }),
  };
};
