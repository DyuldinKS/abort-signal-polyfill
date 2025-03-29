import {
  abortSignalAny,
  abortSignalTimeout,
  abortSignalAbort,
  installAbortSignalPolyfill,
  uninstallAbortSignalPolyfill,
} from './index';

const METHODS = ['any', 'timeout', 'abort'] as const;

const originalMethods: Partial<Record<(typeof METHODS)[number], unknown>> = {};

const saveOriginalMethods = () => {
  for (const key of METHODS) {
    originalMethods[key] = AbortSignal[key];
  }
};

const restoreMethods = () => {
  for (const [key, value] of Object.entries(originalMethods)) {
    if (value as unknown) {
      Object.defineProperty(AbortSignal, key, {
        value,
        configurable: true,
        writable: true,
      });
    } else {
      delete (AbortSignal as any)[key];
    }
  }
};

describe('installAbortSignalPolyfill', () => {
  beforeEach(saveOriginalMethods);
  afterEach(restoreMethods);

  test('should handle undefined AbortSignal', () => {
    const originalAbortSignal = global.AbortSignal;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    try {
      // Delete AbortSignal temporarily
      delete (global as any).AbortSignal;

      installAbortSignalPolyfill();

      expect(warnSpy).toHaveBeenCalledWith(
        'AbortSignal is not defined in this environment. The polyfill will not be installed.',
      );
    } finally {
      // Restore original
      global.AbortSignal = originalAbortSignal;
      warnSpy.mockRestore();
    }
  });

  test('should not override existing AbortSignal methods', () => {
    const mockedMethods = METHODS.map(() => jest.fn());

    METHODS.forEach((key, index) => {
      Object.defineProperty(AbortSignal, key, {
        value: mockedMethods[index],
        configurable: true,
        writable: true,
      });
    });

    // Run installation
    installAbortSignalPolyfill();

    METHODS.forEach((key, index) => {
      expect(AbortSignal[key]).toBe(mockedMethods[index]);
    });
  });

  test('should install AbortSignal.any, AbortSignal.timeout, and AbortSignal.abort if not present', async () => {
    // Remove the methods
    for (const key of METHODS) {
      delete (AbortSignal as any)[key];
      expect(typeof AbortSignal[key]).toBe('undefined');
    }

    const { installAbortSignalPolyfill } = await import('./index');

    // Check methods were NOT added
    for (const key of METHODS) {
      expect(typeof AbortSignal[key]).toBe('undefined');
    }

    // Run installation
    installAbortSignalPolyfill();

    // Check methods were added
    expect(AbortSignal.any).toBe(abortSignalAny);
    expect(AbortSignal.timeout).toBe(abortSignalTimeout);
    expect(AbortSignal.abort).toBe(abortSignalAbort);
  });
});

describe('uninstallAbortSignalPolyfill', () => {
  beforeEach(saveOriginalMethods);
  afterEach(restoreMethods);

  test('should remove all polyfilled methods', () => {
    for (const key of METHODS) {
      delete (AbortSignal as any)[key];
    }

    // First install the polyfill
    installAbortSignalPolyfill();

    // Verify methods are present
    expect(typeof AbortSignal.any).toBe('function');
    expect(typeof AbortSignal.timeout).toBe('function');
    expect(typeof AbortSignal.abort).toBe('function');

    // Uninstall
    uninstallAbortSignalPolyfill();

    // Verify methods are removed
    expect(typeof AbortSignal.any).toBe('undefined');
    expect(typeof AbortSignal.timeout).toBe('undefined');
    expect(typeof AbortSignal.abort).toBe('undefined');
  });

  test('should not remove non-polyfilled methods', () => {
    // Create a mock method that's not from our polyfill
    const mockedMethod = jest.fn();

    for (const key of METHODS) {
      Object.defineProperty(AbortSignal, key, {
        value: mockedMethod,
        configurable: true,
        writable: true,
      });
    }

    // Install our polyfill
    installAbortSignalPolyfill();

    // Uninstall
    uninstallAbortSignalPolyfill();

    for (const key of METHODS) {
      // Verify our polyfilled methods are removed
      expect(AbortSignal[key]).toBe(mockedMethod);
    }
  });

  test('should handle undefined AbortSignal gracefully', () => {
    const originalAbortSignal = global.AbortSignal;
    try {
      delete (global as any).AbortSignal;
      uninstallAbortSignalPolyfill(); // Should not throw
    } finally {
      global.AbortSignal = originalAbortSignal;
    }
  });
});

// a hack to flush combination of micro and macro tasks
export const advanceTimeAsync = async (ms = 0) => {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
};

describe('any + timeout integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    for (const key of METHODS) {
      delete (AbortSignal as any)[key];
    }
    installAbortSignalPolyfill();
  });

  afterEach(() => {
    jest.useRealTimers();
    restoreMethods();
  });

  test('should abort combined signal when timeout occurs', async () => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(500);

    const resSignal = AbortSignal.any([controller.signal, timeoutSignal]);
    const spy = jest.fn();
    resSignal.addEventListener('abort', spy);

    // Verify listener not called before timeout
    expect(spy).not.toHaveBeenCalled();

    // Advance time partially and check again
    await advanceTimeAsync(400);
    expect(spy).not.toHaveBeenCalled();

    await advanceTimeAsync(200); // Total 600ms

    expect(resSignal.aborted).toBe(true);
    expect(resSignal.reason).toBeInstanceOf(DOMException);
    expect(resSignal.reason.name).toBe('TimeoutError');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should abort combined signal with user abort reason when user aborts before timeout', async () => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(1000);

    const resSignal = AbortSignal.any([controller.signal, timeoutSignal]);
    const spy = jest.fn();
    resSignal.addEventListener('abort', spy);

    // Verify listener not called before abort
    expect(spy).not.toHaveBeenCalled();

    await advanceTimeAsync(500);

    // Still shouldn't be called after advancing time but before abort
    expect(spy).not.toHaveBeenCalled();

    const reason = new Error('User cancelled');
    controller.abort(reason);

    expect(resSignal.aborted).toBe(true);
    expect(resSignal.reason).toBe(reason);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should not trigger abort event twice if timeout and user abort happen close together', async () => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(500);

    const resSignal = AbortSignal.any([controller.signal, timeoutSignal]);
    const spy = jest.fn();
    resSignal.addEventListener('abort', spy);

    // Verify listener not called before abort
    expect(spy).not.toHaveBeenCalled();

    // Simulate both events happening very close to each other
    await advanceTimeAsync(499);

    // Still shouldn't be called after advancing time but before abort
    expect(spy).not.toHaveBeenCalled();

    const reason = new Error('User cancelled');
    controller.abort(reason);
    await advanceTimeAsync(2); // Go past the timeout

    expect(resSignal.aborted).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1); // Only one abort event should trigger
  });
});

describe('exports', () => {
  test('should export the required functions', () => {
    expect(typeof abortSignalAny).toBe('function');
    expect(typeof abortSignalTimeout).toBe('function');
    expect(typeof abortSignalAbort).toBe('function');
    expect(typeof installAbortSignalPolyfill).toBe('function');
    expect(typeof uninstallAbortSignalPolyfill).toBe('function');
  });
});
