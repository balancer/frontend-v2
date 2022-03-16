import { computed } from 'vue';
import { isMainnet, isKovan, networkId } from '@/composables/useNetwork';

import { POOLS } from '@/constants/pools';

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

  const lockablePoolAddress = computed(() => POOLS.IdsMap?.['B-80BAL-20WETH']);

  return {
    // computed
    isVeBalSupported,
    veBalTokenInfo,
    veBalBalance,
    lockablePoolAddress
  };
}
