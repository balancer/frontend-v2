import { computed } from 'vue';
import { isMainnet, isKovan } from '@/composables/useNetwork';

import useTokens from './useTokens';
import useConfig from './useConfig';

export const isVeBalSupported = computed(
  () => isMainnet.value || isKovan.value
);

export default function useVeBal() {
  /**
   * COMPOSABLES
   */
  const { balanceFor, getToken } = useTokens();
  const { networkConfig } = useConfig();

  /**
   * COMPUTED
   */
  const veBalTokenInfo = computed(() =>
    getToken(networkConfig.addresses.veBAL)
  );

  const veBalBalance = computed(() =>
    balanceFor(networkConfig.addresses.veBAL)
  );

  return {
    // computed
    isVeBalSupported,
    veBalTokenInfo,
    veBalBalance
  };
}
