import { abortSignalAbort } from './abort';

describe('AbortSignal.abort', () => {
  it('should create an aborted signal with a reason', () => {
    const reason = new Error('Test abort reason');
    const signal = abortSignalAbort(reason);
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe(reason);
  });
});
