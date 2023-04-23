import config from 'config';
import { Profile, Strategy } from 'passport-facebook';

import { oauthMiddlewareFactory } from './index.js';

const facebookClientID = config.get<string>('auth.facebook.clientId');
const facebookClientSecret = config.get<string>('auth.facebook.clientSecret');

const strategyName = 'turbo-facebook';

export type FacebookProfile = Profile;

export default oauthMiddlewareFactory<FacebookProfile>({
  strategyName,
  strategyFactory: (...args) => new Strategy(...args),
  clientId: facebookClientID,
  clientSecret: facebookClientSecret,
  profileFields: ['id', 'displayName', 'emails', 'photos'],
  defaultScope: ['email', 'public_profile'],
});
