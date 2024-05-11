import { configs } from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

import { getTsconfigFile } from '../utils.js';
import javascriptConfig from './javascript.js';

const project = getTsconfigFile();

export const typescript = tseslint.config({
  files: ['**/*.{ts,tsx}'],
  extends: [...tseslint.configs.recommended, configs.typescript],
  languageOptions: {
    parserOptions: {
      project,
    },
  },
});

export default [...javascriptConfig, ...typescript];
