import javascriptConfig from '@slangy-config/eslint/javascript.js';

export default [...javascriptConfig, { ignores: ['config-packages/*', 'packages/*'] }];
