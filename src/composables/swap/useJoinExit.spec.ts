import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { mount } from '@tests/mount-composable-tester';
import { computed, ref } from 'vue';

import { initBalancerWithDefaultMocks } from '@/dependencies/balancer-sdk.mocks';
import useJoinExit from '@/composables/swap/useJoinExit';
import { noop } from 'lodash';

vi.mock('vue-i18n');
vi.mock('vuex');
vi.mock('@/composables/useEthereumTxType');
vi.mock('@/composables/useEthers');
vi.mock('@/composables/useTransactions');
vi.mock('@/locales');
vi.mock('@/services/web3/useWeb3');
vi.mock('@/services/rpc-provider/rpc-provider.service');
vi.mock('@/composables/queries/useRelayerApprovalQuery');

vi.mock('@/providers/tokens.provider', () => ({
  useTokens: () => {
    return {
      injectTokens: vi.fn(noop),
      priceFor: vi.fn(noop),
      useTokens: vi.fn(noop),
      getToken: vi.fn(noop),
    };
  },
}));

vi.mock('@/composables/approvals/useRelayerApproval', () => ({
  __esModule: true,
  default: () =>
    vi.fn().mockImplementation(() => ({
      relayerSignature: '-',
    })),
  RelayerType: {
    BATCH_V4: 'BATCH_V4',
  },
}));

initBalancerWithDefaultMocks();

const mockAmount = BigNumber.from(10);
vi.mock('@/lib/balancer.sdk', () => {
  return {
    balancer: {
      sor: {
        getSwaps: () => {
          return {
            returnAmount: mockAmount,
          };
        },
      },
    },
  };
});

const mockTokenInfoIn = {
  chainId: 5,
  address: '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47',
  name: 'Balancer',
  decimals: 18,
  symbol: 'BAL',
};
const mockTokenInfoOut = {
  chainId: 5,
  address: '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb',
  name: 'USDC',
  decimals: 18,
  symbol: 'USDC',
};

const mockProps = {
  exactIn: ref(true),
  tokenInAddressInput: ref(mockTokenInfoIn.address),
  tokenInAmountInput: ref('10'),
  tokenOutAddressInput: ref(mockTokenInfoOut.address),
  tokenOutAmountInput: ref('0'),
  tokenInAmountScaled: computed(() => parseFixed('1000')),
  tokenOutAmountScaled: computed(() => parseFixed('0')),
  tokenIn: computed(() => mockTokenInfoIn),
  tokenOut: computed(() => mockTokenInfoOut),
  slippageBufferRate: computed(() => 1),
  pools: ref([
    {
      id: '',
      address: '',
      poolType: '',
      swapFee: '',
      swapEnabled: true,
      totalShares: '',
      tokens: [],
      tokensList: [],
    },
  ]),
};

describe('useJoinExit', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(noop);
    vi.spyOn(console, 'time').mockImplementation(noop);
    vi.spyOn(console, 'timeEnd').mockImplementation(noop);
  });

  it('Should load', () => {
    vi.spyOn(console, 'time').mockImplementation(noop);
    const { result } = mount(() => useJoinExit(mockProps));
    expect(result).toBeTruthy();
  });

  it('Should return an available joinExit swap', async () => {
    const { result: joinExit } = mount(() => useJoinExit(mockProps));
    await joinExit.handleAmountChange();
    expect(Number((await joinExit).swapInfo.value?.returnAmount)).toBe(
      Number(mockAmount)
    );
  });
});
