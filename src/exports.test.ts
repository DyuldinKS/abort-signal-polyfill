import {
  abortSignalAny,
  abortSignalTimeout,
  abortSignalAbort,
  installAbortSignalPolyfill,
} from './index';

describe('exports', () => {
  test('should export the required functions', () => {
    expect(typeof abortSignalAny).toBe('function');
    expect(typeof abortSignalTimeout).toBe('function');
    expect(typeof abortSignalAbort).toBe('function');
    expect(typeof installAbortSignalPolyfill).toBe('function');
  });
});
