/**
 * Implementation of AbortSignal.abort()
 * Creates an AbortSignal that is already aborted with the given reason
 * @link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/abort
 */
export function abortSignalAbort(reason?: any): AbortSignal {
  const controller = new AbortController();
  controller.abort(reason);
  return controller.signal;
}
