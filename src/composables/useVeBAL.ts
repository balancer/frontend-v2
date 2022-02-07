import { computed } from 'vue';
import { isMainnet, isKovan, networkId } from '@/composables/useNetwork';
import { TOKENS } from '@/constants/tokens';
import useTokens from './useTokens';
import { TokenInfo } from '@gnosis.pm/safe-apps-sdk';

export const isVeBalSupported = computed(
  () => isMainnet.value || isKovan.value
);

export const vebBalAddress = computed<string>(
  () => TOKENS.IdsMap[networkId.value]
);

export default function useVeBal() {
  const { tokens } = useTokens();

  const veBAL = computed<TokenInfo>(() => tokens[vebBalAddress.value]);

  return {
    // computed
    isVeBalSupported,
    vebBalAddress,
    veBAL
  };
}
