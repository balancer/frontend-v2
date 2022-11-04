// Setup test suite for all test environments.
// This file runs immediately after the test framework has been installed in the environment
// but before the test code itself.

import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
import { server } from '@/tests/msw/server';

registerRequireContextHook();

// MSW SETUP
// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
