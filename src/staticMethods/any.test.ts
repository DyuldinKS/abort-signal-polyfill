import { abortSignalAny } from './any';

const makeNAbortController = (n: number) =>
  Array.from({ length: n }, () => new AbortController());

describe('abortSignalAny', () => {
  test('should handle empty signals array', () => {
    const emptySignal = abortSignalAny([]);
    expect(emptySignal).toBeDefined();
    expect(emptySignal.aborted).toBe(false);

    // Verify it's a valid AbortSignal
    expect(emptySignal instanceof AbortSignal).toBe(true);

    // Verify we can add event listeners to it
    const spy = jest.fn();
    emptySignal.addEventListener('abort', spy);
    expect(spy).not.toHaveBeenCalled();
  });

  test('should create a signal that is not aborted if neither source signal is aborted', () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const resSignal = abortSignalAny([controller1.signal, controller2.signal]);
    const spy = jest.fn();
    resSignal.addEventListener('abort', spy);

    expect(resSignal.aborted).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  const shouldAbortIfSignalNIsInitiallyAborted = (
    signalCount: number,
    abortedSignalIndex: number
  ) => {
    const testName = `should be aborted if signal${
      abortedSignalIndex + 1
    } is initially aborted`;

    test(testName, () => {
      const controllers = makeNAbortController(signalCount);
      const signals = controllers.map(c => c.signal);

      const reason = new Error(`Signal ${abortedSignalIndex + 1} aborted`);
      controllers[abortedSignalIndex].abort(reason);

      const resSignal = abortSignalAny(signals);
      const spy = jest.fn();
      resSignal.addEventListener('abort', spy);

      expect(resSignal.aborted).toBe(true);
      expect(resSignal.reason).toBe(reason);
      // If the signal is already aborted, the abort event won't be dispatched again
      expect(spy).not.toHaveBeenCalled();
    });
  };

  shouldAbortIfSignalNIsInitiallyAborted(2, 0);
  shouldAbortIfSignalNIsInitiallyAborted(2, 1);
  shouldAbortIfSignalNIsInitiallyAborted(3, 0);
  shouldAbortIfSignalNIsInitiallyAborted(3, 1);
  shouldAbortIfSignalNIsInitiallyAborted(3, 2);

  const testShouldAbortWhenSignalNAborts = (
    signalCount: number,
    abortedSignalIndex: number
  ) => {
    const testName = `should abort when signal ${abortedSignalIndex} aborts`;

    test(testName, () => {
      const controllers = Array.from(
        { length: signalCount },
        () => new AbortController()
      );

      const signals = controllers.map(controller => controller.signal);

      const resSignal = abortSignalAny(signals);
      const spy = jest.fn();
      resSignal.addEventListener('abort', spy);

      // Verify listener not called before abort
      expect(spy).not.toHaveBeenCalled();

      const reason = new Error(testName);
      controllers[abortedSignalIndex].abort(reason);

      expect(resSignal.aborted).toBe(true);
      expect(resSignal.reason).toBe(reason);
      expect(spy).toHaveBeenCalled();
    });
  };

  testShouldAbortWhenSignalNAborts(1, 0);
  testShouldAbortWhenSignalNAborts(2, 0);
  testShouldAbortWhenSignalNAborts(2, 1);
  testShouldAbortWhenSignalNAborts(4, 2);
  testShouldAbortWhenSignalNAborts(4, 3);
  testShouldAbortWhenSignalNAborts(20, 4);

  test('should use the reason from the first signal that aborts', () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();
    const resSignal = abortSignalAny([
      controller1.signal,
      controller2.signal,
      controller3.signal,
    ]);

    const spy = jest.fn();
    resSignal.addEventListener('abort', spy);

    // Verify listener not called before abort
    expect(spy).not.toHaveBeenCalled();

    const reason1 = new Error('Signal 1 aborted');
    const reason2 = new Error('Signal 2 aborted');

    // Abort both signals in quick succession
    controller2.abort(reason2);
    controller1.abort(reason1);

    expect(resSignal.aborted).toBe(true);
    expect(resSignal.reason).toBe(reason2);
    expect(spy).toHaveBeenCalledTimes(1); // Only called once despite two abort calls
  });

  test('should clean up event listeners when signal1 aborts', () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();

    // Spy on removeEventListener
    const spy1 = jest.spyOn(controller1.signal, 'removeEventListener');
    const spy2 = jest.spyOn(controller2.signal, 'removeEventListener');

    const resSignal = abortSignalAny([controller1.signal, controller2.signal]);
    const abortSpy = jest.fn();
    resSignal.addEventListener('abort', abortSpy);

    // Verify listener not called before abort
    expect(abortSpy).not.toHaveBeenCalled();

    controller1.abort();

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(abortSpy).toHaveBeenCalledTimes(1);
  });

  test('should clean up event listeners when signal2 aborts', () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();

    // Spy on removeEventListener
    const spy1 = jest.spyOn(controller1.signal, 'removeEventListener');
    const spy2 = jest.spyOn(controller2.signal, 'removeEventListener');

    const resSignal = abortSignalAny([controller1.signal, controller2.signal]);
    const abortSpy = jest.fn();
    resSignal.addEventListener('abort', abortSpy);

    // Verify listener not called before abort
    expect(abortSpy).not.toHaveBeenCalled();

    controller2.abort();

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(abortSpy).toHaveBeenCalledTimes(1);
  });
});
