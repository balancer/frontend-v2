import { render } from '@testing-library/vue';
import { graphql } from 'msw';
import { server } from '@/tests/msw/server';
import InvestFormV2 from './InvestFormV2.vue';
import pool from '@/services/balancer/pools/joins/handlers/__tests__/pool';
import {
  JoinPoolProviderSymbol,
  JoinPoolProvider,
} from '@/providers/local/join-pool.provider';
import BalCheckbox from '@/components/_global/BalCheckbox/BalCheckbox.vue';

import Web3Plugin from '@/services/web3/web3.plugin';
// import useWeb3 from '@/services/web3/useWeb3';
import { QueryClient, VUE_QUERY_CLIENT } from 'vue-query';
import useJoinPool from '@/composables/pools/useJoinPool';
import blocknative from '@/plugins/blocknative';
import { h } from 'vue';

jest.unmock('@/services/web3/useWeb3');
jest.mock('@/lib/balancer.sdk.ts', () => {
  return jest.fn().mockImplementation(() => {
    return {
      fetchPoolsForSor: jest.fn(),
      balancer: {},
      hasFetchedPoolsForSor: {
        value: true,
      },
    };
  });
});

jest.mock('@/composables/useVeBAL', () => {
  return jest.fn().mockImplementation(() => {
    return {
      veBalTokenInfo: {
        address: '0xC128a9954e6c874eA3d62ce62B468bA073093F25',
        chainId: 1,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC128a9954e6c874eA3d62ce62B468bA073093F25/logo.png',
        name: 'Vote Escrowed Balancer BPT',
        symbol: 'veBAL',
        decimals: 18,
      },
    };
  });
});

jest.mock('@/composables/useTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getToken: jest.fn().mockReturnValue({
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        chainId: 1,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC128a9954e6c874eA3d62ce62B468bA073093F25/logo.png',
        name: 'DAI Token',
        symbol: 'DAI',
        decimals: 18,
      }),
      injectTokens: jest.fn(),
      dynamicDataLoading: { value: false },
      balances: {
        value: { '0x6B175474E89094C44Da98b954EedeAC495271d0F': '1' },
      },
      wrappedNativeAsset: {
        value: {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        },
      },
      nativeAsset: {
        value: {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        },
      },
    };
  });
});

// Infinite loop crahing tests
jest.mock('@/composables/useMyWalletTokens', () => {
  return jest.fn().mockImplementation(() => {
    return {
      poolTokensWithBalance: {
        value: ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
      },
      isLoadingBalances: {
        value: false,
      },
      poolTokensWithoutBalance: {
        value: [],
      },
    };
  });
});
jest.mock('@/composables/useApp', () => {
  return jest.fn().mockImplementation(() => {
    return {
      appLoading: {
        value: false,
      },
    };
  });
});

describe.skip('InvestFormV2.vue', () => {
  it('should query join with pool tokens', () => {
    const queryClient = new QueryClient();
    queryClient.mount();

    server.use(
      graphql.query('Pools', (req, res, ctx) => {
        return res(ctx.data({ pools: [] }));
      })
    );

    const { html } = render(JoinPoolProvider, {
      slots: {
        default: h(InvestFormV2, { pool: pool }),
      },
      props: {
        pool,
        isSingleAssetJoin: false,
      },
      global: {
        components: {
          // TODO: refactor tests to use registerComponents without warnings
          BalCheckbox,
        },
        plugins: [Web3Plugin, blocknative],
        provide: {
          // [Web3ProviderSymbol]: Web3Plugin,
          [VUE_QUERY_CLIENT]: queryClient,
          [JoinPoolProviderSymbol]: useJoinPool,
          // [TokensProviderSymbol]: TokensProvider,
        },
      },
    });
    console.log({ html: html() });
  });
});
