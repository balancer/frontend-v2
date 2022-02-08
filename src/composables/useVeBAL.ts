import { computed } from 'vue';
import { isMainnet, isKovan, networkId } from '@/composables/useNetwork';

import { TOKENS } from '@/constants/tokens';

import useTokens from './useTokens';
import { getAddress } from '@ethersproject/address';

export const isVeBalSupported = computed(
  () => isMainnet.value || isKovan.value
);

export const vebBalAddress = computed<string>(
  () => TOKENS.IdsMap[networkId.value]?.veBAL
);

export default function useVeBal() {
  /**
   * COMPOSABLES
   */
  const { tokens, balanceFor } = useTokens();

  /**
   * COMPUTED
   */
  const veBalTokenInfo = computed(() => tokens.value[vebBalAddress.value]);
  const veBalBalance = computed(() => balanceFor(vebBalAddress.value));

  return {
    // computed
    isVeBalSupported,
    vebBalAddress,
    veBalTokenInfo,
    veBalBalance
  };
}
