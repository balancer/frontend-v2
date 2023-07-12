// Setup test suite for all test environments.
// This file runs immediately after the test framework has been installed in the environment
// but before the test code itself.
import '@testing-library/jest-dom';
import './setup-msw';
import './mockMatchMedia';
import { noop } from 'lodash';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/composables/useEthers');
vi.mock('@/composables/useTransactions');

// 1 Jan 2023
const mockDate = new Date(2023, 0, 1);
vi.setSystemTime(mockDate);

//Globally silence time tracing to avoid noise in tests
beforeAll(() => {
  vi.spyOn(console, 'time').mockImplementation(noop);
  vi.spyOn(console, 'timeEnd').mockImplementation(noop);
});

beforeEach(() => {
  vi.clearAllMocks();
});
