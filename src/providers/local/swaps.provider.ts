/**
 * Provides swap related state.
 */
import symbolKeys from '@/constants/symbol.keys';
import { SwapType } from '@balancer-labs/sdk';
import { captureException } from '@sentry/browser';
import { InjectionKey } from 'vue';
import { safeInject } from '../inject';

/**
 * TYPES
 */
type TokenInput = {
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
   * COMPUTED
   */
  const priceImpact = computed((): number => 0);

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
  function querySwap() {
    try {
      const output = await swapService.querySwap();
    } catch (error) {
      captureException(error);
      throw new Error('Failed to fetch swap.', { cause: error });
    }
  }

  watch(
    () => tokenIn,
    newTokenIn => console.log('tokenIn', newTokenIn),
    { deep: true }
  );

  watch(
    () => tokenOut,
    newTokenOut => console.log('tokenOut', newTokenOut),
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
