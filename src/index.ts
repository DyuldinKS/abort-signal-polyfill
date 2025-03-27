/**
 * Abort Signal Polyfill
 *
 * This package provides a polyfill for the AbortSignal static methods:
 * - AbortSignal.any() https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any
 * - AbortSignal.timeout() https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout
 * - AbortSignal.abort() https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/abort
 */

import './types';
import { abortSignalAny } from './staticMethods/any';
import { abortSignalTimeout } from './staticMethods/timeout';
import { abortSignalAbort } from './staticMethods/abort';
import type { AbortSignalPolyfill } from './types';

type StaticMethodName = 'any' | 'timeout' | 'abort';

const maybeInstallStaticMethod = <Args extends unknown[], Ret>(
  name: StaticMethodName,
  method: (...args: Args) => Ret,
) => {
  if (!(name in AbortSignal)) {
    Object.defineProperty(AbortSignal, name, {
      value: method,
      configurable: true,
      writable: true,
    });
  }
};

const maybeUninstallStaticMethod = <Args extends unknown[], Ret>(
  name: StaticMethodName,
  method: (...args: Args) => Ret,
) => {
  if (name in AbortSignal && (AbortSignal[name] as unknown) === method) {
    delete AbortSignal[name];
  }
};

/**
 * Installs the polyfill if the methods are not already available
 */
export function installAbortSignalPolyfill(): void {
  if (typeof AbortSignal === 'undefined') {
    console.warn(
      'AbortSignal is not defined in this environment. The polyfill will not be installed.',
    );
    return;
  }

  maybeInstallStaticMethod('any', abortSignalAny);
  maybeInstallStaticMethod('timeout', abortSignalTimeout);
  maybeInstallStaticMethod('abort', abortSignalAbort);
}

/**
 * Uninstalls the polyfill by removing the added methods
 * Note: This will only remove methods that were added by this polyfill
 * and will not restore any previously existing implementations
 */
export function uninstallAbortSignalPolyfill(): void {
  if (typeof AbortSignal === 'undefined') return;

  maybeUninstallStaticMethod('any', abortSignalAny);
  maybeUninstallStaticMethod('timeout', abortSignalTimeout);
  maybeUninstallStaticMethod('abort', abortSignalAbort);
}

// Export the implementations for users who want to manually install
export { abortSignalAny, abortSignalTimeout, abortSignalAbort };
export type { AbortSignalPolyfill };
