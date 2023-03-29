import { mountComposable } from '@tests/mount-helpers';
import { BigNumber, formatFixed, parseFixed } from '@ethersproject/bignumber';
import OldBigNumber from 'bignumber.js';
import { computed, ref } from 'vue';

import useSor, { calcPriceImpact } from '@/composables/swap/useSor';
import { SorManager } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

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

    // expected slippage is 0.11111
    // This is 10% less, but calculated as (expected / actual) = (1 / 0.9)
    const expectedSlippageUnformatted = parseFixed('1', 36)
      .div(parseFixed('0.9', 18))
      .sub(parseFixed('1', 18));
    const expectedSlippage = formatFixed(expectedSlippageUnformatted, 18).slice(
      0,
      10
    );

    describe('USDC <> ETH', () => {
      /**
       * SwapExactIn USDC -> ETH
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 2000 USDC
       * Variable Token = 0.9 ETH
       */
      it('Should give 10% slippage when doing a swapExactIn from USDC -> ETH', () => {
        const priceImpact = calcPriceImpact(
          18,
          parseFixed('0.9', 18),
          parseFixed('2000', 6),
          '2000'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
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
          6,
          parseFixed('1800', 6),
          parseFixed('1', 18),
          '2000'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
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
          6,
          parseFixed('1800', 6),
          parseFixed('1', 18),
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
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
          18,
          parseFixed('0.9', 18),
          parseFixed('2000', 6),
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
      });
    });

    describe('DAI <> ETH', () => {
      /**
       * SwapExactIn DAI -> ETH
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 2000 DAI
       * Variable Token = 0.9 ETH
       */
      it('Should give 10% slippage when doing a swapExactIn from DAI -> ETH', () => {
        const priceImpact = calcPriceImpact(
          18,
          parseFixed('0.9', 18),
          parseFixed('2000', 18),
          '2000'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
      });

      /**
       * SwapExactOut USDC -> DAI
       * MarketSP = 2000
       * Slippage = 10%
       * Fixed Token = 1 ETH
       * Variable Token = 1800 DAI
       */
      it('Should give 10% slippage when doing a swapExactOut from DAI -> ETH', () => {
        const priceImpact = calcPriceImpact(
          18,
          parseFixed('1800', 18),
          parseFixed('1', 18),
          '2000'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
      });

      /**
       * SwapExactIn ETH -> DAI
       * MarketSP = 0.0005
       * Slippage = 10%
       * Fixed Token = 1 ETH
       * Variable Token = 1800 DAI
       */
      it('Should give 10% slippage when doing a swapExactIn from ETH -> DAI', () => {
        const priceImpact = calcPriceImpact(
          18,
          parseFixed('1800', 18),
          parseFixed('1', 18),
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
      });

      /**
       * SwapExactOut ETH -> DAI
       * MarketSP = 0.0005
       * Slippage = 10%
       * Fixed Token = 2000 DAI
       * Variable Token = 0.9 ETH
       */
      it('Should give 10% slippage when doing a swapExactOut from ETH -> DAI', () => {
        const priceImpact = calcPriceImpact(
          18,
          parseFixed('0.9', 18),
          parseFixed('2000', 18),
          '0.0005'
        );
        expect(formatFixed(priceImpact, 18).slice(0, 10)).toBe(
          expectedSlippage
        );
      });
    });
  });
});
