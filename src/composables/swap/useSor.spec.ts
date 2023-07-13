import { mountComposable } from '@tests/mount-helpers';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import OldBigNumber from 'bignumber.js';
import { computed, ref } from 'vue';

import useSor, { calcPriceImpact } from '@/composables/swap/useSor';
import { SorManager } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { SwapType } from '@sobal/sdk';

vi.mock('@/lib/utils/balancer/helpers/sor/sorManager');

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
    1
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

  describe('calcPriceImpact', () => {
    /**
     * For all of the following tests we are using the following values:
     * USDC price: 1
     * DAI price: 1
     * ETH price: 2000
     *
     * The Fixed token is the one that has a fixed amount specified
     * The variable token is the one who's amount is calculated by SOR
     *
     */

    describe('USDC <> ETH', () => {
      // The expected slippage for USDC <> ETH is 10%
      const expectedSlippage = '0.1';

      /**
       * SwapExactIn USDC -> ETH
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 2000 USDC
       * Variable Token = 0.9 ETH
       */
      it('Should give 10% slippage when doing a swapExactIn from USDC -> ETH', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('2000', 6),
          6,
          parseFixed('0.9', 18),
          18,
          SwapType.SwapExactIn,
          '2000'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });

      /**
       * SwapExactOut USDC -> ETH
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 1 ETH
       * Variable Token = 1800 USDC
       */
      it('Should give 10% slippage when doing a swapExactOut from USDC -> ETH', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('1800', 6),
          6,
          parseFixed('1', 18),
          18,
          SwapType.SwapExactOut,
          '2000'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });

      /**
       * SwapExactIn ETH -> USDC
       * MarketSP = 0.0005
       * Slippage = 10%
       * Fixed Token = 1 ETH
       * Variable Token = 1800 USDC
       */
      it('Should give 10% slippage when doing a swapExactIn from ETH -> USDC', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('1', 18),
          18,
          parseFixed('1800', 6),
          6,
          SwapType.SwapExactIn,
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });

      /**
       * SwapExactOut ETH -> USDC
       * MarketSP = 0.0005
       * Slippage = 10%
       * Fixed Token = 2000 USDC
       * Variable Token = 0.9 ETH
       */
      it('Should give 10% slippage when doing a swapExactOut from ETH -> USDC', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('0.9', 18),
          18,
          parseFixed('2000', 6),
          6,
          SwapType.SwapExactOut,
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });
    });

    describe('DAI <> ETH', () => {
      // The expected slippage for DAI <> ETH is 10%
      const expectedSlippage = '0.2';

      /**
       * SwapExactIn DAI -> ETH
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 2000 DAI
       * Variable Token = 0.9 ETH
       */
      it('Should give 20% slippage when doing a swapExactIn from DAI -> ETH', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('2000', 18),
          18,
          parseFixed('0.8', 18),
          18,
          SwapType.SwapExactIn,
          '2000'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });

      /**
       * SwapExactOut USDC -> DAI
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 1 ETH
       * Variable Token = 1800 DAI
       */
      it('Should give 20% slippage when doing a swapExactOut from DAI -> ETH', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('1600', 18),
          18,
          parseFixed('1', 18),
          18,
          SwapType.SwapExactOut,
          '2000'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });

      /**
       * SwapExactIn ETH -> DAI
       * MarketSP = 0.0005
       * Slippage = 10%
       * Fixed Token = 1 ETH
       * Variable Token = 1800 DAI
       */
      it('Should give 20% slippage when doing a swapExactIn from ETH -> DAI', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('1', 18),
          18,
          parseFixed('1600', 18),
          18,
          SwapType.SwapExactIn,
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });

      /**
       * SwapExactOut ETH -> DAI
       * MarketSP = 0.0005
       * Slippage = 10%
       * Fixed Token = 2000 DAI
       * Variable Token = 0.9 ETH
       */
      it('Should give 20% slippage when doing a swapExactOut from ETH -> DAI', () => {
        const priceImpact = calcPriceImpact(
          parseFixed('0.8', 18),
          18,
          parseFixed('2000', 18),
          18,
          SwapType.SwapExactOut,
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18)).toBe(expectedSlippage);
      });
    });
  });
});
