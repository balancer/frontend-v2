import { computed } from 'vue';
import { isMainnet, isKovan, networkId } from '@/composables/useNetwork';

import { TOKENS } from '@/constants/tokens';

import useTokens from './useTokens';

export const isVeBalSupported = computed(
  () => isMainnet.value || isKovan.value
);

export const vebBalAddress = computed<string>(
  () => TOKENS.IdsMap[networkId.value]?.veBAL
);

export default function useVeBal() {
  const { tokens } = useTokens();

  const veBAL = computed(() => tokens.value[vebBalAddress.value]);

  return {
    // computed
    isVeBalSupported,
    vebBalAddress,
    veBAL
  };
}
