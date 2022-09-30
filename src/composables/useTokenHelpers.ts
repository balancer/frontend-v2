import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';

import { TOKENS } from '@/constants/tokens';
import { isSameAddress } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';

import useTokens from './useTokens';

const balAddress = getAddress(TOKENS.Addresses.BAL);

function isBalAddress(address: string): boolean {
  return isSameAddress(address, balAddress);
}

export function useTokenHelpers() {
  /**
   * COMPOSABLES
   */
  const { getToken, wrappedNativeAsset, nativeAsset } = useTokens();

  /**
   * COMPUTED
   */
  const balToken = computed((): TokenInfo => getToken(balAddress));

  /**
   * METHODS
   */
  function replaceWethWithEth(addresses: string[]): string[] {
    return addresses.map(address => {
      if (isSameAddress(address, wrappedNativeAsset.value.address)) {
        return nativeAsset.address;
      }
      return address;
    });
  }

  return {
    // computed
    balAddress,
    balToken,
    // methods
    isBalAddress,
    replaceWethWithEth,
  };
}
