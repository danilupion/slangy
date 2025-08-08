import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { config } from 'typescript-eslint';

import typescriptConfig from './typescript.js';

export const typescriptReact = config(
  {
    ...reactRecommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
);

export default config(...typescriptConfig, ...typescriptReact);
