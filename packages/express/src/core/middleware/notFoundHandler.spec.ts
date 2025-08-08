import createError from 'http-errors';
import { describe, expect, it } from 'vitest';

import notFoundHandler from './notFoundHandler.js';

describe('notFoundHandler middleware', () => {
  it('notFoundHandler throws ClientErrorNotFound', () => {
    try {
      notFoundHandler();
      expect.fail('Expected notFoundHandler to throw ClientErrorNotFound, but it did not throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(createError.NotFound);
    }
  });
});
