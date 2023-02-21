/**
 * Provides swap related state.
 */
import symbolKeys from '@/constants/symbol.keys';
import { SwapProtocol, swapService } from '@/services/swaps/swap.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';
import { SwapType } from '@balancer-labs/sdk';
import { captureException } from '@sentry/browser';
import { debounce } from 'lodash';
import { InjectionKey } from 'vue';
import { safeInject } from '../inject';
import { useTokens } from '../tokens.provider';
import { useUserSettings } from '../user-settings.provider';

/**
 * TYPES
 */
export type TokenInput = {
  address: string;
  amount: string;
  valid: boolean;
};

const provider = () => {
  /**
   * STATE
   */
  const isLoading = ref<boolean>(false);
  const swapProtocol = ref<SwapProtocol>(SwapProtocol.Balancer);
  const swapType = ref<SwapType>(SwapType.SwapExactIn);

  const tokenIn = reactive<TokenInput>({
    address: '',
    amount: '',
    valid: true,
  });

  const tokenOut = reactive<TokenInput>({
    address: '',
    amount: '',
    valid: true,
  });

  /**
   * COMPOSABLES
   */
  const { getTokens } = useTokens();
  const { getSigner } = useWeb3();
  const { slippageBsp } = useUserSettings();

  /**
   * COMPUTED
   */
  const priceImpact = computed((): number => 0);

  const tokenData = computed(
    (): TokenInfoMap => getTokens([tokenIn.address, tokenOut.address])
  );

  // Cowswap mode is toggled on.
  const isCowswap = computed(
    (): boolean => swapProtocol.value === SwapProtocol.Cowswap
  );

  /**
   * METHODS
   */
  function setSwapProtocol(protocol: SwapProtocol) {
    swapProtocol.value = protocol;
  }

  function setSwapType(type: SwapType) {
    swapType.value = type;
  }

  /**
   * When amounts change we need to query the swap and get the expected output.
   */
  const debounceQuerySwap = debounce(querySwap, 1000);
  async function querySwap(
    swapType: SwapType,
    tokenIn: TokenInput,
    tokenOut: TokenInput
  ) {
    try {
      swapService.setSwapHandler(swapProtocol.value);

      const output = await swapService.querySwap({
        swapType,
        tokenIn,
        tokenOut,
        tokenData: tokenData.value,
        slippageBsp: slippageBsp.value,
        signer: getSigner(),
      });

      if (swapType === SwapType.SwapExactIn) {
        tokenOut.amount = output.returnAmount;
      } else if (swapType === SwapType.SwapExactOut) {
        tokenIn.amount = output.returnAmount;
      }
      console.log('output', output);
    } catch (error) {
      captureException(error);
      throw new Error('Failed to fetch swap.', { cause: error });
    }
  }

  watch(
    () => tokenIn,
    newTokenIn => {
      console.log('tokenIn', newTokenIn);
      debounceQuerySwap(SwapType.SwapExactIn, newTokenIn, tokenOut);
    },
    { deep: true }
  );

  watch(
    () => tokenOut,
    newTokenOut => {
      console.log('tokenOut', newTokenOut);
      debounceQuerySwap(SwapType.SwapExactOut, tokenIn, newTokenOut);
    },
    { deep: true }
  );

  watch(swapType, newSwapType => console.log('swapType', newSwapType));

  return {
    tokenIn,
    tokenOut,
    isLoading,
    priceImpact,
    swapProtocol,
    isCowswap,
    setSwapProtocol,
    setSwapType,
  };
};

export type SwapsProviderResponse = ReturnType<typeof provider>;
export const SwapsProviderSymbol: InjectionKey<SwapsProviderResponse> = Symbol(
  symbolKeys.Providers.Swaps
);

export function provideSwaps() {
  provide(SwapsProviderSymbol, provider());
}

export function useSwaps(): SwapsProviderResponse {
  return safeInject(SwapsProviderSymbol);
}
