import { server } from '@tests/msw/server';
import { fetch } from 'cross-fetch';

// By default, our setup would use happy-dom fetch() implementation which is not 100% compatible with MSW
global.fetch = fetch;

// MSW SETUP
// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
