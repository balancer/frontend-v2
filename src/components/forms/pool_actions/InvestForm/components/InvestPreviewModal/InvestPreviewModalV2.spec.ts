import { screen, within } from '@testing-library/vue';
import InvestPreviewModalV2 from './InvestPreviewModalV2.vue';
import pool from '@/__mocks__/goerli-boosted-pool';
import { JoinPoolProvider } from '@/providers/local/join-pool.provider';
import { server } from '@/tests/msw/server';
import { rest } from 'msw';

import { QueryClient } from 'vue-query';

import { Multicaller } from '@/lib/utils/balancer/contract';
import renderComponent from '@/tests/renderComponent';

jest.unmock('@/services/web3/useWeb3');
jest.mock('@ethersproject/providers');
jest.mock('@/services/rpc-provider/rpc-provider.service');

// Mocking injecting veBAL token metadata
jest.mock('@/lib/utils/balancer/contract');
jest.mock('@/composables/staking/useStaking', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isPoolEligibleForStaking: true,
    };
  });
});

// Mock token price data
jest.mock('@/lib/balancer.sdk', () => {
  return {
    hasFetchedPoolsForSor: {
      value: true,
    },
    fetchPoolsForSor: jest.fn(),
    balancer: {
      data: {
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
    },
  };
});

// @ts-expect-error
Multicaller.mockImplementation(() => {
  return {
    call: jest.fn(),
    execute: jest.fn().mockResolvedValue({
      '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF': {
        address: '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
        chainId: 5,
        decimals: 18,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x33A99Dcc4C85C014cf12626959111D5898bbCAbF/logo.png',
        name: 'Vote Escrowed Balancer BPT',
        symbol: 'veBAL',
      },
    }),
  };
});

const handlers = [
  // rest.get(
  //   'https://api.coingecko.com/api/v3/simple/price/',
  //   (req, res, ctx) => {
  //     return res(ctx.json({ ethereum: { eth: 1.0, usd: 1233.12 } }));
  //   }
  // ),
  rest.post(
    'https://eth-mainnet.alchemyapi.io/v2/cQGZUiTLRCFsQS7kbRxPJK4eH4fTTu88',
    (req, res, ctx) => {
      return res(ctx.json([{ jsonrpc: '2.0', id: 42, result: '0x1' }]));
    }
  ),
];

const DAI = '0xb8096bc53c3ce4c11ebb0069da0341d75264b104';
const amountInDAI = '2';

const USDT = '0x14468fd5e1de5a5a4882fa5f4e2217c5a8ddcadb';
const amountInUSDT = '1';

const fiatValueIn = '3.00';
const fiatValueOut = '3.01';

const bptOut = '4';

describe('InvestPreviewModalV2.vue', () => {
  beforeEach(() => {
    server.use(...handlers);
  });
  afterEach(() => {
    server.resetHandlers();
  });

  it('should show correct token amounts in and out', async () => {
    const queryClient = new QueryClient();
    queryClient.mount();

    renderComponent(
      InvestPreviewModalV2,
      {
        props: {
          pool,
          isSingleAssetJoin: false,
          amountsIn: [
            {
              address: USDT,
              value: amountInUSDT,
              valid: true,
            },
            {
              address: DAI,
              value: amountInDAI,
              valid: true,
            },
          ],
          bptOut,
          fiatValueIn,
          fiatValueOut,
          priceImpact: 0.001,
          highPriceImpact: false,
          rektPriceImpact: false,
          missingPricesIn: false,
          isLoadingQuery: false,
          txInProgress: false,
          queryJoinQuery: {
            refetch: jest.fn(),
          },
          resetAmounts: jest.fn(),
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

    const tokensInWrapper = await screen.findByTestId('tokens-in');
    const tokensOutWrapper = await screen.findByTestId('tokens-out');

    const priceImpact = await screen.findByText('0.10%');

    // Check tokens in values

    // DAI
    const DAIValueInText = await within(tokensInWrapper).findByText('$2.00');
    const DAIWeightInText = await within(tokensInWrapper).findByText(
      /66\.67%/i
    );
    expect(DAIValueInText).toBeVisible();
    expect(DAIWeightInText).toBeVisible();

    // USDT
    const USDTValueInText = await within(tokensInWrapper).findByText('$1.00');
    const USDTWeightInText = await within(tokensInWrapper).findByText(
      /33\.33%/i
    );
    expect(USDTValueInText).toBeVisible();
    expect(USDTWeightInText).toBeVisible();

    // Check tokens out values
    const fiatValueOutText = await within(tokensOutWrapper).findByText(
      `$${fiatValueOut}`
    );
    const tokenOutText = await within(tokensOutWrapper).findByText(
      pool.symbol as string
    );
    const bptOutText = await within(tokensOutWrapper).findByText(bptOut);

    expect(bptOutText).toBeVisible();
    expect(tokenOutText).toBeVisible();
    expect(fiatValueOutText).toBeVisible();
    expect(priceImpact).toBeVisible();
  });
});
