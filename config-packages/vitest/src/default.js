import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    coverage: {
      exclude: [...configDefaults.coverage.exclude],
    },
  },
});
