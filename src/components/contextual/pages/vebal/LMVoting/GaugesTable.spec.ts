// import '@/__mocks__/matchMedia';

import { render, screen } from '@testing-library/vue';

import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalTable from '@/components/_global/BalTable/BalTable.vue';
import CompositionIcon from '@/components/_global/icons/CompositionIcon.vue';
import NetworkIcon from '@/components/_global/icons/NetworkIcon.vue';

import GaugesTable from './GaugesTable.vue';

const gaugeId = '0x34f33CDaED8ba0E1CEECE80e5f4a73bcf234cfac';

const gauge = {
  address: gaugeId,
  network: 1,
  pool: {
    id: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
    address: '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42',
    poolType: 'Stable',
    symbol: 'staBAL2',
    tokens: [
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        weight: 'null',
        symbol: 'USDC'
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        weight: 'null',
        symbol: 'USDT'
      }
    ]
  },
  tokenLogoURIs: {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7':
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
  },
  votes: '8212341531532800',
  votesNextPeriod: '6934407282299320',
  userVotes: '0',
  lastUserVoteTime: 0
};

const expiredGauges = [gaugeId];
const gauges = [gauge];

GaugesTable.components = {
  NetworkIcon,
  BalTable,
  BalAssetSet,
  BalBtn,
  CompositionIcon,
  BalCard
};

// TODO: Remove useDarkMode mock everywhere and polyfill window.matchMedia
jest.mock('@/composables/useDarkMode', () => {
  return jest.fn().mockImplementation(() => {
    return { darkMode: true };
  });
});
// jest.mock('@/composables/useTailwind', () => {
//   return jest.fn().mockImplementation(() => {
//     return { theme: { colors: {} } };
//   });
// });

jest.mock('@/services/web3/useWeb3', () => {
  return jest.fn().mockImplementation(() => {
    return { isWalletReady: true, account: '0x1111' };
  });
});
jest.mock('@/composables/useTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      injectTokens: jest.fn().mockImplementation(),
      priceFor: jest.fn().mockImplementation(),
      hasBalance: jest.fn().mockReturnValue(false),
      balanceFor: jest.fn().mockReturnValue('0'),
      getToken: jest.fn().mockImplementation(address => {
        const mockTokens = {
          '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': {
            symbol: 'MKR'
          },
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
            symbol: 'WETH'
          },
          '0xdac17f958d2ee523a2206206994597c13d831ec7': {
            symbol: 'USDT'
          },
          '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115': {
            symbol: 'USDC',
            decimals: 6
          }
        };
        return mockTokens[address];
      })
    };
  });
});

// TODO: Test
describe('GaugesTable', () => {
  it('should render right tokens for gauge', async () => {
    render(GaugesTable, {
      global: {
        stubs: {
          Jazzicon: { template: '<span />' },
          BalLoadingBlock: { template: '<span />' }
        }
      },
      props: {
        data: gauges
      }
    });
    const usdt = await screen.findByText('USDT');
    const usdc = await screen.findByText('USDC');

    expect(usdt).toBeVisible();
    expect(usdc).toBeVisible();
  });

  it('should render expired label if gauge is expired', async () => {
    render(GaugesTable, {
      global: {
        stubs: {
          Jazzicon: { template: '<span />' },
          BalLoadingBlock: { template: '<span />' }
        }
      },
      props: {
        expiredGauges,
        data: gauges
      }
    });

    const expired = await screen.findByText(/Expired/i);

    expect(expired).toBeVisible();
  });
});
