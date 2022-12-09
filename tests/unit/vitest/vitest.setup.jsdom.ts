// Setup file for jsdom.
// This file will be executed in the testing environment before executing
// setupFilesAfterEnv and before the test code itself.

// Mock window.matchMedia
// @ts-ignore
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
