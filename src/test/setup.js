import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Silence React Router v6 -> v7 future-flag warnings in test output.
// (They don't affect behavior; we opt into the flags in app runtime already.)
const originalWarn = console.warn;
const originalError = console.error;

const shouldIgnoreReactRouterFutureWarning = (args) => {
  const first = args?.[0];
  return typeof first === 'string' && first.includes('React Router Future Flag Warning');
};

console.warn = (...args) => {
  if (shouldIgnoreReactRouterFutureWarning(args)) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  if (shouldIgnoreReactRouterFutureWarning(args)) {
    return;
  }
  originalError(...args);
};

globalThis.navigator.clipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
