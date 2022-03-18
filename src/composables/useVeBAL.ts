import { computed } from 'vue';
import { isMainnet, isKovan } from '@/composables/useNetwork';

import { POOLS } from '@/constants/pools';

import useTokens from './useTokens';
import useConfig from './useConfig';
import { bnum } from '@/lib/utils';
import { oneYearInSecs } from './useTime';

export const isVeBalSupported = computed(
  () => isMainnet.value || isKovan.value
);

/**
 * @summary Calculate expected veBAL given BPT being locked and lock time in seconds.
 * @param {string} bpt - BPT amount being locked up
 * @param {number} lockTime - Time in seconds from now to last epoch before
 * chosen lock date
 */
export function expectedVeBal(bpt: string, lockTime: number): string {
  return bnum(bpt)
    .times(lockTime)
    .div(oneYearInSecs)
    .toString();
}

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
