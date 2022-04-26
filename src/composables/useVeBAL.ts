import { differenceInSeconds } from 'date-fns';
import { computed, ref } from 'vue';

import {
  isArbitrum,
  isKovan,
  isMainnet,
  isPolygon
} from '@/composables/useNetwork';
import { POOLS } from '@/constants/pools';
import { bnum } from '@/lib/utils';

import useConfig from './useConfig';
import { getPreviousThursday, oneYearInSecs } from './useTime';
import useTokens from './useTokens';

/**
 * STATE
 */
const showRedirectModal = ref(false);

/**
 * COMPUTED
 */
export const isVeBalSupported = computed(
  () => isMainnet.value || isKovan.value
);

/**
 * METHODS
 */
function setShowRedirectModal(newVal: boolean) {
  showRedirectModal.value = newVal;
}

/**
 * @summary Calculate expected veBAL given BPT being locked and lock time in seconds.
 * @param {string} bpt - BPT amount being locked up
 * @param {str} lockDateStr - Date in string format used to create Date of lock
 */
export function expectedVeBal(bpt: string, lockDateStr: string): string {
  const now = new Date();
  const lockDate = new Date(lockDateStr);
  const previousThursdayBeforeLockDate = getPreviousThursday(lockDate);
  const lockTime = differenceInSeconds(previousThursdayBeforeLockDate, now);

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

  const lockablePoolId = computed(() => POOLS.IdsMap?.['B-80BAL-20WETH']);

  return {
    // computed
    isVeBalSupported,
    veBalTokenInfo,
    veBalBalance,
    lockablePoolId,
    showRedirectModal,
    // methods
    setShowRedirectModal
  };
}
