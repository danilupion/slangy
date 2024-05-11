import { eslintFix, prettier, typescriptBuildCheck, vitest } from './commands.js';
import { allGlob, javascriptGlob, typescriptGlob } from './globs.js';

export const prettierlAllTask = {
  [allGlob]: [prettier],
};

export const eslintJavascriptTask = {
  [javascriptGlob]: [eslintFix],
};

export const eslintTypescriptTask = {
  [typescriptGlob]: [eslintFix],
};

export const buildCheckTypescriptTask = {
  [typescriptGlob]: [typescriptBuildCheck],
};

export const vitestTypescriptTask = {
  [typescriptGlob]: [vitest],
};
