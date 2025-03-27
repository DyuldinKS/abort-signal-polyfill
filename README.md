# abort-signal-polyfill

A lightweight polyfill for `AbortSignal.any`, `AbortSignal.timeout`, and `AbortSignal.abort` methods.

## Features

- [`AbortSignal.any(signals: AbortSignal[])`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any): Creates an AbortSignal that will be aborted when any of the given signals is aborted
- [`AbortSignal.timeout(timeoutMs: number)`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout): Creates an AbortSignal that will be aborted after the specified timeout
- [`AbortSignal.abort(reason?: any)`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/abort): Creates an AbortSignal that is already aborted with an optional reason

## Installation

```bash
npm install abort-signal-polyfill
```

## Usage

```typescript
import {
  installAbortSignalPolyfill,
  uninstallAbortSignalPolyfill,
} from 'abort-signal-polyfill';

// Install the polyfill
installAbortSignalPolyfill();

const timeoutSignal = AbortSignal.timeout(5000); // 5 second timeout
const controller = new AbortController();

// Combine signals - will abort if either timeout occurs or controller aborts
const signal = AbortSignal.any([timeoutSignal, controller.signal]);

try {
  const response = await fetch(url, { signal });
  const data = await response.json();
  // Handle successful response
} catch (err) {
  if (err.name === 'TimeoutError') {
    // Handle timeout case
    console.error('The request timed out');
  } else {
    // Handle other errors
    console.error('Request failed:', err);
  }
}

// Uninstall polyfills if needed
uninstallAbortSignalPolyfill();
```

## TypeScript Support

```typescript
import type { AbortSignalPolyfill } from 'abort-signal-polyfill';

// For older TypeScript versions that may not have proper types for AbortSignal
(AbortSignal as AbortSignalPolyfill).timeout(2000);
```

## Browser Support

This polyfill works in all modern browsers that support `AbortController` and `AbortSignal`. For older browsers, you'll need to include a polyfill for `AbortController` first.

## License

MIT
