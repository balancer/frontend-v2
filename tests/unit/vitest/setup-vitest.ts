// Setup test suite for all test environments.
// This file runs immediately after the test framework has been installed in the environment
// but before the test code itself.
import '@testing-library/jest-dom';
import './setup-msw';
import './mockMatchMedia';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/composables/useEthers');
vi.mock('@/composables/useTransactions');
