import config from 'config';

export const isDev = config.get<string>('environment') === 'development';
