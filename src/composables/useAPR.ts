import { bnum } from '@/lib/utils';
import { AprBreakdown } from '@sobal/sdk';

/**
 * @summary A pool has staking rewards if there either a BAL
 * emission or if there is a rewards emission
 */
export function hasStakingRewards(aprs?: AprBreakdown) {
  if (!aprs?.stakingApr) return false;

  return (
    bnum(aprs.stakingApr?.min || 0).gt(0) ||
    bnum(aprs.rewardAprs.total || 0).gt(0)
  );
}

/**
 * @summary Checks if a pool has BAL emissions
 */
export function hasBalEmissions(aprs?: AprBreakdown): boolean {
  if (!aprs) return false;
  return bnum(aprs?.stakingApr?.min || 0).gt(0);
}

export function useAPR() {
  return {
    hasStakingRewards,
    hasBalEmissions,
  };
}
