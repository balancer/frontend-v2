import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';

import { TOKENS } from '@/constants/tokens';
import { isSameAddress } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';

import useTokens from './useTokens';

export function useTokenHelpers() {
  /**
   * COMPOSABLES
   */
  const { getToken } = useTokens();

  /**
   * COMPUTED
   */
  const balAddress = computed((): string => getAddress(TOKENS.Addresses.BAL));

  const balToken = computed((): TokenInfo => getToken(balAddress.value));

  /**
   * METHODS
   */
  function isBalAddress(address: string): boolean {
    return isSameAddress(address, balAddress.value);
  }

  return {
    // computed
    balAddress,
    balToken,
    // methods
    isBalAddress
  };
}
