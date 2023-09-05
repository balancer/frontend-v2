import { aprMinOrTotal } from '@/lib/utils/api';
import { GqlPoolApr } from '@/services/api/graphql/generated/api-types';

/**
 * @summary A pool has staking rewards if there either a BAL
 * emission or if there is a rewards emission
 */
export function hasStakingRewards(aprs?: GqlPoolApr) {
  if (!aprs?.nativeRewardApr) return false;

  return (
    aprMinOrTotal(aprs.nativeRewardApr).gt(0) ||
    aprMinOrTotal(aprs.thirdPartyApr).gt(0)
  );
}

/**
 * @summary Checks if a pool has BAL emissions
 */
export function hasBalEmissions(aprs?: GqlPoolApr): boolean {
  if (!aprs) return false;
  return aprMinOrTotal(aprs.nativeRewardApr).gt(0);
}

export function useAPR() {
  return {
    hasStakingRewards,
    hasBalEmissions,
  };
}
