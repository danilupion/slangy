export const prettier = 'prettier --ignore-unknown --write';

export const eslintFix = 'eslint --fix --max-warnings 0 --cache --cache-strategy content';

// This is a function because tsc --noEmit cannot be used with files (which is the default behavior of lint-staged)
export const typescriptBuildCheck = () => 'tsc --noEmit';

export const vitest = 'vitest related --run';
