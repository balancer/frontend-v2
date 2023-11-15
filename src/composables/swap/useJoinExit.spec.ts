import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { computed, ref } from 'vue';

import useJoinExit from '@/composables/swap/useJoinExit';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { noop } from 'lodash';

initDependenciesWithDefaultMocks();

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

  it('Should load', async () => {
    vi.spyOn(console, 'time').mockImplementation(noop);
    const { result } = await mountComposable(() => useJoinExit(mockProps));
    expect(result).toBeTruthy();
  });

  it('Should return an available joinExit swap', async () => {
    const { result: joinExit } = await mountComposable(() =>
      useJoinExit(mockProps)
    );
    await joinExit.handleAmountChange();
    expect(Number((await joinExit).swapInfo.value?.returnAmount)).toBe(
      Number(mockAmount)
    );
  });
});
