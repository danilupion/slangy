import deepmerge from 'deepmerge';

import {
  buildCheckTypescriptTask,
  eslintJavascriptTask,
  eslintTypescriptTask,
  prettierlAllTask,
  vitestTypescriptTask,
} from '../subtasks.js';

export default {
  ...prettierlAllTask,
  ...eslintJavascriptTask,
  ...deepmerge.all([buildCheckTypescriptTask, eslintTypescriptTask, vitestTypescriptTask]),
};

export const noTests = {
  ...prettierlAllTask,
  ...eslintJavascriptTask,
  ...deepmerge.all([buildCheckTypescriptTask, eslintTypescriptTask]),
};
