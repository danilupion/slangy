import deepmerge from 'deepmerge';

import {
  buildCheckTypescriptTask,
  eslintJavascriptTask,
  eslintTypescriptTask,
  vitestTypescriptTask,
} from '../subtasks.js';

export default {
  ...eslintJavascriptTask,
  ...deepmerge.all([buildCheckTypescriptTask, eslintTypescriptTask, vitestTypescriptTask]),
};

export const noTests = {
  ...eslintJavascriptTask,
  ...deepmerge.all([buildCheckTypescriptTask, eslintTypescriptTask]),
};
