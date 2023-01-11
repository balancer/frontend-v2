// Setup test suite for jsdom.
import '@testing-library/jest-dom';

import { config, RouterLinkStub } from '@vue/test-utils';

vi.mock('@/services/web3/useWeb3');
vi.mock('@/composables/useEthers');
vi.mock('@/composables/useTransactions');

// Testing Library config
config.global.stubs = {
  RouterLink: RouterLinkStub,
  Jazzicon: true,
  BalIcon: true,
  LightBulbIcon: true,
};
