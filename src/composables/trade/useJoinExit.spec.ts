import { parseFixed } from '@ethersproject/bignumber';
import { computed, ref } from 'vue';
import { mount } from '@/tests/mount-composable-tester';

import useJoinExit from '@/composables/trade/useJoinExit';

jest.mock('vue-i18n');
jest.mock('vuex');
jest.mock('@/composables/useEthereumTxType');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/useTransactions');
jest.mock('@/locales');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/rpc-provider/rpc-provider.service');

jest.mock('@/providers/tokens.provider', () => ({
  useTokens: () => {
    return {
      injectTokens: jest.fn().mockImplementation(),
      priceFor: jest.fn().mockImplementation(),
      useTokens: jest.fn().mockImplementation(),
      getToken: jest.fn().mockImplementation(),
    };
  },
}));

jest.mock('@/composables/approvals/useRelayerApproval', () => ({
  __esModule: true,
  default: () =>
    jest.fn().mockImplementation(() => ({
      relayerSignature: '-',
    })),
  RelayerType: {
    BATCH_V4: 'BATCH_V4',
  },
}));

const mockAmount = 10;
jest.mock('@/lib/balancer.sdk', () => {
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
  pools: ref([]),
};

describe('useJoinExit', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  it('Should load', () => {
    jest.spyOn(console, 'time').mockImplementation();
    const { result } = mount(() => useJoinExit(mockProps));
    expect(result).toBeTruthy();
  });

  it('Should pass return an available joinExit trade', async () => {
    const { result: joinExit } = mount(() => useJoinExit(mockProps));
    await joinExit.handleAmountChange();
    expect(Number((await joinExit).swapInfo.value?.returnAmount)).toBe(
      Number(mockAmount)
    );
  });
});
