import { Ref, computed, reactive, toRefs } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';

/**
 * STATE
 */
const state = reactive({
  isProportional: true,
  tokenOut: '',
  validInput: true,
  highPriceImpactAccepted: false,
  submitting: false
});

export default function useWithdrawalState(pool: Ref<FullPool>) {
  /**
   * COMPUTED
   */
  const tokenOutIndex = computed(() =>
    pool.value.tokenAddresses.indexOf(state.tokenOut)
  );

  return {
    ...toRefs(state),
    tokenOutIndex
  };
}
