import { Ref, computed, reactive, toRefs } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';

/**
 * STATE
 */
const state = reactive({
  isProportional: true,
  tokenOut: '',
  validInput: true,
  highPriceImpactAccepted: false,
  submitting: false,
  slider: {
    val: 1000,
    max: 1000,
    min: 0,
    interval: 1
  }
});

export default function useWithdrawalState(pool: Ref<FullPool>) {
  /**
   * COMPOSABLES
   */
  const { nativeAsset, wrappedNativeAsset } = useTokens();

  /**
   * COMPUTED
   */
  const tokensOut = computed(() => {
    if (!state.isProportional && state.tokenOut === nativeAsset.address)
      // replace WETH with ETH
      return pool.value.tokenAddresses.map(address => {
        if (address === wrappedNativeAsset.value.address) {
          return nativeAsset.address;
        }
        return address;
      });

    return pool.value.tokenAddresses;
  });

  const tokenOutIndex = computed(() => {
    return tokensOut.value.indexOf(state.tokenOut);
  });

  /**
   * METHODS
   */
  function maxSlider(): void {
    state.slider.val = state.slider.max;
  }

  return {
    ...toRefs(state),
    tokensOut,
    tokenOutIndex,
    // methods
    maxSlider
  };
}
