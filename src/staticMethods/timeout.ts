/**
 * Implementation of AbortSignal.timeout
 * Creates a signal that will be aborted after the specified timeout.
 * @link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout
 */
export function abortSignalTimeout(ms: number): AbortSignal {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort(
      new DOMException(`signal timed out after ${ms} ms`, 'TimeoutError')
    );
  }, ms);

  return controller.signal;
}
