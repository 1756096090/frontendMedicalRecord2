// src/setupTests.ts
import '@testing-library/jest-dom';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM tras cada test
afterEach(() => {
  cleanup();
});

// (Opcional) Polyfills si llegas a necesitarlos
// globalThis.TextEncoder = globalThis.TextEncoder || require('util').TextEncoder;
// globalThis.TextDecoder = globalThis.TextDecoder || require('util').TextDecoder;
