import config from 'config';

export enum EnvironmentMode {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const mode = config.get<EnvironmentMode>('mode');

if (!Object.values(EnvironmentMode).includes(mode)) {
  throw new Error(`Invalid mode: ${mode}`);
}

export const runsInDevelopmentMode = mode === EnvironmentMode.Development;
export const runsInProductionMode = mode === EnvironmentMode.Production;
export const runsInTestMode = mode === EnvironmentMode.Test;
