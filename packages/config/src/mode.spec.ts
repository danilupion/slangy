import config from 'config';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('config');

describe('mode helper', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should correctly identify development mode', async () => {
    (config.get as Mock).mockImplementation((key: string) => {
      if (key === 'mode') {
        return 'development';
      }
    });

    const { runsInDevelopmentMode, runsInProductionMode, runsInTestMode } = await import(
      './mode.js'
    );
    expect(runsInDevelopmentMode).toBe(true);
    expect(runsInProductionMode).toBe(false);
    expect(runsInTestMode).toBe(false);
  });

  it('should correctly identify production mode', async () => {
    (config.get as Mock).mockImplementation((key: string) => {
      if (key === 'mode') {
        return 'production';
      }
    });

    const { runsInDevelopmentMode, runsInProductionMode, runsInTestMode } = await import(
      './mode.js'
    );
    expect(runsInDevelopmentMode).toBe(false);
    expect(runsInProductionMode).toBe(true);
    expect(runsInTestMode).toBe(false);
  });

  it('should correctly identify test mode', async () => {
    (config.get as Mock).mockImplementation((key: string) => {
      if (key === 'mode') {
        return 'test';
      }
    });

    const { runsInDevelopmentMode, runsInProductionMode, runsInTestMode } = await import(
      './mode.js'
    );
    expect(runsInDevelopmentMode).toBe(false);
    expect(runsInProductionMode).toBe(false);
    expect(runsInTestMode).toBe(true);
  });

  it('should throw an error if mode is not a valid EnvironmentMode', async () => {
    (config.get as Mock).mockImplementation((key: string) => {
      if (key === 'mode') {
        return 'invalid-mode';
      }
    });

    try {
      await import('./mode.js');
      expect.fail('Expected to throw an error, but it did not throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid mode: invalid-mode');
    }
  });
});
