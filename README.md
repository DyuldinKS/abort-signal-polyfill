# abort-signal-polyfill

A lightweight polyfill for `AbortSignal.any()`, `AbortSignal.timeout()`, and `AbortSignal.abort()` methods.

## Features

- `AbortSignal.any()`: Creates an AbortSignal that will be aborted when any of the given signals is aborted
- `AbortSignal.timeout()`: Creates an AbortSignal that will be aborted after the specified timeout
- `AbortSignal.abort()`: Creates an AbortSignal that is already aborted with an optional reason

## Installation

```bash
npm install abort-signal-polyfill
```

## Usage

```typescript
import 'abort-signal-polyfill';
// or
import { installAbortSignalPolyfill } from 'abort-signal-polyfill';

// Install the polyfill
installAbortSignalPolyfill();

// Example using AbortSignal.any() and AbortSignal.timeout()
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
    // Handle abort case - either timeout occurred or abort() was called
    console.log('The request was timeout out');
  } else {
    // Handle other errors
    console.error('Request failed:', err);
  }
}
```

## TypeScript Support

```js
import type { AbortSignalPolyfill } from 'abort-signal-polyfill';

// old TypeScript may not have proper types for AbortSignal.
(AbortSignal as AbortSignalPolyfill).timeout(2000);
```

## Browser Support

This polyfill works in all modern browsers that support `AbortController` and `AbortSignal`. For older browsers, you'll need to include a polyfill for `AbortController` first.

## License

MIT
