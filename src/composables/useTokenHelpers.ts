import { TOKENS } from '@/constants/tokens';
import { computed } from 'vue';
import { networkId } from './useNetwork';

export function useTokenHelpers() {
  /**
   * COMPUTED
   */
  const balAddress = computed(
    (): string => TOKENS.AddressMap[networkId.value]?.BAL
  );

  /**
   * METHODS
   */
  function isBalAddress(address: string): boolean {
    return address === balAddress.value;
  }

  return {
    // computed
    balAddress,
    // methods
    isBalAddress
  };
}
