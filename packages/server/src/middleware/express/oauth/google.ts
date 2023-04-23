import config from 'config';
import { Profile, Strategy } from 'passport-google-oauth20';

import { oauthMiddlewareFactory } from './index.js';

const googleClientID = config.get<string>('auth.google.clientId');
const googleClientSecret = config.get<string>('auth.google.clientSecret');

const strategyName = 'turbo-google';

export type GoogleProfile = Profile;

export default oauthMiddlewareFactory<GoogleProfile>({
  strategyName,
  strategyFactory: (...args) => new Strategy(...args),
  clientId: googleClientID,
  clientSecret: googleClientSecret,
  defaultScope: ['email', 'profile'],
});
