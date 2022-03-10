import { TOKENS } from '@/constants/tokens';
import { TokenInfo } from '@/types/TokenList';
import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';
import { networkId } from './useNetwork';
import useTokens from './useTokens';

export function useTokenHelpers() {
  /**
   * COMPOSABLES
   */
  const { getToken } = useTokens();

  /**
   * COMPUTED
   */
  const balAddress = computed((): string =>
    getAddress(TOKENS.AddressMap[networkId.value]?.BAL)
  );

  const balToken = computed((): TokenInfo => getToken(balAddress.value));

  /**
   * METHODS
   */
  function isBalAddress(address: string): boolean {
    return address === balAddress.value;
  }

  return {
    // computed
    balAddress,
    balToken,
    // methods
    isBalAddress
  };
}
