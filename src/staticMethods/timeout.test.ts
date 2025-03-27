import { abortSignalTimeout } from './timeout';

// a hack to flush combination of micro and macro tasks
export const advanceTimeAsync = async (ms = 0) => {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
};

describe('abortSignalTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should create a signal that is not initially aborted', () => {
    const signal = abortSignalTimeout(1000);
    const spy = jest.fn();
    signal.addEventListener('abort', spy);

    expect(signal.aborted).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  test('should abort the signal after the specified timeout', async () => {
    const signal = abortSignalTimeout(500);
    const spy = jest.fn();
    signal.addEventListener('abort', spy);

    // Verify listener not called before timeout
    expect(spy).not.toHaveBeenCalled();

    await advanceTimeAsync(500);

    expect(spy).toHaveBeenCalled();
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBeInstanceOf(DOMException);
    expect(signal.reason.name).toBe('TimeoutError');
    expect(signal.reason.message).toBe('signal timed out after 500 ms');
  });

  test('should not abort the signal before the timeout', async () => {
    const signal = abortSignalTimeout(1000);
    const spy = jest.fn();
    signal.addEventListener('abort', spy);

    await advanceTimeAsync(999);

    expect(signal.aborted).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
