/**
 * Type declarations for the AbortSignal polyfill
 */

export type AbortSignalPolyfill = {
  prototype: AbortSignal;
  new (): AbortSignal;
  abort(reason?: any): AbortSignal;
  timeout(milliseconds: number): AbortSignal;
  any(signals: AbortSignal[]): AbortSignal;
};
