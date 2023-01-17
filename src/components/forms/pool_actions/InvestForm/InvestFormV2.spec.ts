import {
  screen,
  within,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/vue';
import InvestFormV2 from './InvestFormV2.vue';
import pool from '@/__mocks__/goerli-boosted-pool';
import { JoinPoolProvider } from '@/providers/local/join-pool.provider';
import { server } from '@/tests/msw/server';
import { graphql, rest } from 'msw';
import { generateTestingUtils } from 'eth-testing';

import QUERY_KEYS from '@/constants/queryKeys';
import { Network } from '@balancer-labs/sdk';
import { ref, computed, reactive } from 'vue';
import { queryClient } from '@/plugins/vueQuery';

import { Multicaller, multicall } from '@/lib/utils/balancer/contract';
import renderComponent from '@/tests/renderComponent';
import { QueryResponse as UseBalancesQueryResponse } from '@/composables/queries/useBalancesQuery';
import { configService } from '@/services/config/config.service';
import { QueryResponse as UseAllowancesQueryResponse } from '@/composables/queries/useAllowancesQuery';

jest.unmock('@/services/web3/useWeb3');
jest.unmock('@/providers/tokens.provider');
// jest.mock('@ethersproject/providers');
jest.mock('@/services/rpc-provider/rpc-provider.service');

// Mocking injecting veBAL token metadata
jest.mock('@/lib/utils/balancer/contract');

// @ts-expect-error
multicall.mockImplementation(async () => {
  return [];
});

// @ts-expect-error
Multicaller.mockImplementation(() => {
  return {
    call: jest.fn(),
    execute: () => {
      return {
        '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF': {
          address: '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
          chainId: 5,
          decimals: 18,
          logoURI:
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x33A99Dcc4C85C014cf12626959111D5898bbCAbF/logo.png',
          name: 'Vote Escrowed Balancer BPT',
          symbol: 'veBAL',
        },
      };
    },
  };
});
jest.mock('@/composables/staking/useStaking', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isPoolEligibleForStaking: true,
    };
  });
});
jest.mock('@balancer-labs/sdk', () => {
  const originalModule = jest.requireActual('@balancer-labs/sdk');
  return {
    __esModule: true,
    ...originalModule,
    PoolsSubgraphRepository: jest.fn().mockImplementation(() => ({
      fetch: jest.fn().mockResolvedValue([]),
    })),
    BalancerSDK: jest.fn().mockImplementation(() => ({
      swaps: {
        fetchPools: jest.fn().mockResolvedValue(true),
      },
      pools: {
        generalisedJoin: jest.fn().mockResolvedValue({
          callData: '0xac9650d8000000000000000000',
          expectedOut: '21625108427627685',
          minOut: '21408857343351409',
          priceImpact: '2985494340',
          to: '0x2536dfeeCB7A0397CF98eDaDA8486254533b1aFA',
        }),
      },
      data: {
        // Mock token price data
        tokenPrices: {
          find: async address => {
            const priceData = {
              '0x3d5981BDD8D3E49EB7BBDC1d2B156a3eE019c18e': {
                usd: '1.01',
                eth: 0.0007877,
              },
              '0xd03D4d8B4669d135569215dD6C4e790307c8E14B': {
                usd: '1.00',
                eth: 0.0007877,
              },
              '0x4D983081b9B9f3393409A4CDf5504D0AeA9CD94c': {
                usd: '1.00',
                eth: 0.0007877,
              },
              '0x594920068382f64E4bC06879679bD474118b97b1': {
                usd: '1.00',
                eth: 0.0007877,
              },
              '0xDabD33683bAfDd448968Ab6d6f47C3535c64bf0c': {
                usd: '1.00',
                eth: 0.0007877,
              },
              '0xB8096bC53c3cE4c11Ebb0069Da0341d75264B104': {
                usd: '1.00',
                eth: 0.0007877,
              },
              '0x14468FD5E1de5A5a4882fa5f4e2217C5A8dDcadb': {
                usd: '1.00',
                eth: 0.0007877,
              },
            };
            return priceData[address];
          },
        },
      },
    })),
  };
});

const handlers = [
  // rest.get(
  //   'https://api.coingecko.com/api/v3/simple/price/',
  //   (req, res, ctx) => {
  //     return res(ctx.json({ ethereum: { eth: 1.0, usd: 1233.12 } }));
  //   }
  // ),
  graphql.query('StakingData', (req, res, ctx) => {
    return res(ctx.data({ gaugeShares: [], liquidityGauges: [] }));
  }),
  graphql.query('PoolGaugeAddresses', (req, res, ctx) => {
    return res(ctx.data({ pools: [] }));
  }),
  graphql.query('PoolStakingEligibility', (req, res, ctx) => {
    return res(ctx.data({ liquidityGauges: [] }));
  }),
  graphql.query('PoolSharesQuery', (req, res, ctx) => {
    return res(ctx.data({ poolShares: [] }));
  }),
  rest.post(
    'https://eth-mainnet.alchemyapi.io/v2/cQGZUiTLRCFsQS7kbRxPJK4eH4fTTu88',
    (req, res, ctx) => {
      return res(ctx.json([{ jsonrpc: '2.0', id: 42, result: '0x1' }]));
    }
  ),
];

const DAI = '0xB8096bC53c3cE4c11Ebb0069Da0341d75264B104';
const TEST_ACCOUNT = '0x8fE3a2A5ae6BaA201C26fC7830EB713F33d6b313';

function addTokenBalancesToCache(overrideBalances: UseBalancesQueryResponse) {
  const balances = {
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '1.0',
    '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47': '1.0',
    '0x8c9e6c40d3402480ACE624730524fACC5482798c': '1.0',
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE': '1.0',
    '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb': '1.0',
    '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1': '1.0',
    '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9': '1.0',
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391': '1.0',
    '0x3d5981BDD8D3E49EB7BBDC1d2B156a3eE019c18e': '1.0',
    '0xd03D4d8B4669d135569215dD6C4e790307c8E14B': '1.0',
    '0x4D983081b9B9f3393409A4CDf5504D0AeA9CD94c': '1.0',
    '0x594920068382f64E4bC06879679bD474118b97b1': '1.0',
    '0xDabD33683bAfDd448968Ab6d6f47C3535c64bf0c': '1.0',
    [DAI]: '1.0',
    '0x14468FD5E1de5A5a4882fa5f4e2217C5A8dDcadb': '1.0',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF': '1.0',
  };

  // Update the initial balances with the token balances
  Object.keys(overrideBalances).forEach(address => {
    balances[address] = overrideBalances[address];
  });

  const network = ref(Network.GOERLI);
  const account = ref(TEST_ACCOUNT);
  const tokenAddresses = computed(() => Object.keys(balances));

  const balancesQueryKey = reactive(
    QUERY_KEYS.Account.Balances(network, account, tokenAddresses)
  );

  queryClient.setQueryData<UseBalancesQueryResponse>(
    balancesQueryKey,
    balances,
    {}
  );
}

function addAllowancesToCache() {
  const balances = {
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '1.0',
    '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47': '1.0',
    '0x8c9e6c40d3402480ACE624730524fACC5482798c': '1.0',
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE': '1.0',
    '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb': '1.0',
    '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1': '1.0',
    '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9': '1.0',
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391': '1.0',
    '0x3d5981BDD8D3E49EB7BBDC1d2B156a3eE019c18e': '1.0',
    '0xd03D4d8B4669d135569215dD6C4e790307c8E14B': '1.0',
    '0x4D983081b9B9f3393409A4CDf5504D0AeA9CD94c': '1.0',
    '0x594920068382f64E4bC06879679bD474118b97b1': '1.0',
    '0xDabD33683bAfDd448968Ab6d6f47C3535c64bf0c': '1.0',
    [DAI]: '1.0',
    '0x14468FD5E1de5A5a4882fa5f4e2217C5A8dDcadb': '1.0',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF': '1.0',
  };

  const response = {
    [configService.network.addresses.vault]: {
      ...balances,
    },
    [configService.network.addresses.wstETH]: {
      ...balances,
    },
    [configService.network.addresses.veBAL]: {
      ...balances,
    },
  };
  const network = ref(Network.GOERLI);
  const account = ref(TEST_ACCOUNT);
  const tokenAddresses = computed(() => Object.keys(balances));
  const contractAddresses = ref([
    configService.network.addresses.vault,
    configService.network.addresses.wstETH,
    configService.network.addresses.veBAL,
  ]);

  const allowancesQueryKey = reactive(
    QUERY_KEYS.Account.Allowances(
      network,
      account,
      contractAddresses,
      tokenAddresses
    )
  );

  // TODO: After vue-query update, use the query filters to
  // set the query data so the key doesn't have to match exactly
  queryClient.setQueryData<UseAllowancesQueryResponse>(
    // ['account', 'allowances'],
    allowancesQueryKey,
    response
  );
}

const testingUtils = generateTestingUtils({ providerType: 'MetaMask' });
function mockWalletConnection() {
  testingUtils.mockChainId(5);

  // testingUtils.mockConnectedWallet(
  //   [TEST_ACCOUNT],
  //   { chainId: 5 }
  // );
  testingUtils.mockNotConnectedWallet();
  // Mock the connection request of MetaMask
  testingUtils.mockRequestAccounts([TEST_ACCOUNT], { chainId: 5 });
  // testingUtils.mockAccounts([TEST_ACCOUNT]);
}

async function clickConnectWallet() {
  // screen.debug();
  const connectButton = await screen.findByRole('button', {
    name: /Connect wallet/i,
  });
  // Click the button
  await fireEvent.click(connectButton);

  await waitForElementToBeRemoved(connectButton);
}

async function factory(tokenBalances: UseBalancesQueryResponse = {}) {
  mockWalletConnection();
  addAllowancesToCache();
  addTokenBalancesToCache(tokenBalances);
  const renderResult = renderComponent(
    InvestFormV2,
    {
      props: {
        pool,
      },
    },
    {
      providers: [
        {
          component: JoinPoolProvider,
          props: { pool, isSingleAssetJoin: false },
        },
      ],
    }
  );

  const title = await screen.findByText(/Add liquidity/i);
  expect(title).toBeVisible();

  await clickConnectWallet();

  return renderResult;
}

describe('InvestFormV2.vue', () => {
  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    // @ts-expect-error
    global.window.ethereum = testingUtils.getProvider();
  });
  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
    queryClient.clear();
  });
  beforeEach(() => {
    server.use(...handlers);
  });
  afterEach(() => {
    server.resetHandlers();
  });

  it('should show input if user has token balance', async () => {
    await factory();

    const BB_A_USDC_input = await screen.findByLabelText(/bb-a-USDC/i);
    const DAI_input = await screen.findByLabelText('DAI');

    expect(BB_A_USDC_input).toBeVisible();
    expect(DAI_input).toBeVisible();
  });

  it('should be able to set max amount in', async () => {
    await factory({
      [DAI]: '1.112',
    });

    const DAI_input = await screen.findByLabelText('DAI');

    const DAI_inputContainer = await screen.findByTestId(
      /token-input-0xB8096bC53c3cE4c11Ebb0069Da0341d75264B104/i
    );

    // Find the max button
    const DAImaxBtn = within(DAI_inputContainer).getByRole('button', {
      name: /Max/i,
    });

    // Click the max button
    await fireEvent.click(DAImaxBtn);

    // Check the input value
    expect(DAI_input).toHaveValue(1.112);

    // Check the preview button is not disabled
    const previewBtn = await screen.findByRole('button', { name: /Preview/i });
    await waitFor(() => expect(previewBtn).not.toBeDisabled());
  });

  it('should show error if input amount exceeds wallet balance', async () => {
    await factory();

    const BB_A_USDC_input = await screen.findByLabelText(/bb-a-USDC/i);

    await fireEvent.update(BB_A_USDC_input, '2');

    await screen.findByText(/Exceeds wallet balance/i);

    // Check the preview button is disabled
    const previewBtn = await screen.findByRole('button', { name: /Preview/i });
    expect(previewBtn).toBeDisabled();
  });

  it('should not show token input if user balance is 0', async () => {
    await factory({
      [DAI]: '0.0',
    });

    const BB_A_USDC_input = await screen.findByLabelText(/bb-a-USDC/i);
    const DAI_input = screen.queryByLabelText('DAI');

    expect(BB_A_USDC_input).toBeVisible();
    expect(DAI_input).toBeNull();
  });

  it.skip('Check the price impact', async () => {
    // TODO: Check the price impact
  });
});
