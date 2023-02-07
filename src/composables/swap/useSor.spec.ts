import { mountComposable } from '@tests/mount-helpers';
import { BigNumber } from '@ethersproject/bignumber';
import OldBigNumber from 'bignumber.js';
import { computed, ref } from 'vue';

import useSor from '@/composables/swap/useSor';
import { SorManager } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

vi.mock('@/composables/useEthereumTxType');
vi.mock('@/lib/utils/balancer/helpers/sor/sorManager');
vi.mock('@/services/rpc-provider/rpc-provider.service');

const mockNativeAssetAddress = configService.network.nativeAsset.address;
const mockEthPrice = 3000;
const mockTokenPrice = 0.2;

vi.mock('@/providers/tokens.provider', () => ({
  useTokens: () => {
    return {
      injectTokens: vi.fn(),
      priceFor: vi.fn(address => {
        if (address === mockNativeAssetAddress) {
          return mockEthPrice;
        }
        return mockTokenPrice;
      }),
      useTokens: vi.fn(),
      getToken: vi.fn(),
    };
  },
}));

const mockTokenInfo = {
  chainId: 1,
  address: '0x0',
  name: 'mockTokenIn',
  decimals: 18,
  symbol: 'MTI',
};

const computedMockTokenInfo = computed(() => mockTokenInfo);

const mockProps = {
  exactIn: ref(false),
  tokenInAddressInput: ref('0x0'),
  tokenInAmountInput: ref('1'),
  tokenOutAddressInput: ref('0x0'),
  tokenOutAmountInput: ref('1'),
  wrapType: ref(0),
  tokenIn: computedMockTokenInfo,
  tokenOut: computedMockTokenInfo,
  slippageBufferRate: computed(() => 1),
  isCowswapSwap: computed(() => false),
};

describe('useSor', () => {
  it('Should load', () => {
    vi.spyOn(console, 'time');
    const { result } = mountComposable(() => useSor(mockProps));
    expect(result).toBeTruthy();
  });
});

describe('setSwapCost', () => {
  const sorManager = new SorManager(
    rpcProviderService.jsonProvider,
    BigNumber.from(1),
    1,
    1,
    '1'
  );

  const mockedSorManager = vi.mocked(sorManager);

  beforeEach(() => {
    mockedSorManager.setCostOutputToken.mockClear();
    vi.spyOn(console, 'log');
    vi.spyOn(console, 'time');
    vi.spyOn(console, 'timeEnd');
  });

  it('Should pass a correct gas price to sorManager', async () => {
    const { result: sor } = mountComposable(() => useSor(mockProps));

    const tokenAddress = '0x0';
    const tokenDecimals = 5;
    const expectedTokenPriceInEth = new OldBigNumber(
      mockEthPrice / mockTokenPrice
    ).toString();

    await sor.setSwapCost(tokenAddress, tokenDecimals, mockedSorManager as any);
    expect(mockedSorManager.setCostOutputToken).toBeCalledWith(
      tokenAddress,
      tokenDecimals,
      expectedTokenPriceInEth
    );
  });
});
