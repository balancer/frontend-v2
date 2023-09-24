import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { FNumFormats, numF } from '@/composables/useNumbers';
import { oneSecondInMs, toUtcTime } from '@/composables/useTime';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { bnum, isSameAddress, scale } from '@/lib/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { differenceInWeeks, format } from 'date-fns';

/*
 * Common pure functions used by different composables in the veBAL voting feature
 */
export function isGaugeNew(pool: VotingPool): boolean {
  const addedTimestamp = pool.gauge.addedTimestamp;
  if (!addedTimestamp) return false;
  return differenceInWeeks(Date.now(), addedTimestamp * oneSecondInMs) < 2;
}

export function isGaugeExpired(
  expiredGauges: readonly string[] | undefined,
  gaugeAddress: string
): boolean {
  if (!expiredGauges) return false;
  return !!expiredGauges.some(item => isSameAddress(gaugeAddress, item));
}

export function isPoolExpired(pool: VotingPool) {
  return pool.gauge.isKilled;
}

export function hasOnlyExpiredPools(
  votingGauges: string[],
  expiredGauges?: readonly string[]
) {
  if (!expiredGauges) return false;
  return votingGauges.every(gaugeAddress =>
    isGaugeExpired(expiredGauges, gaugeAddress)
  );
}

// Vote weight is saved as basis points (bps) onchain (i.e. 20% is stored as 2000)
// so we use this method to work with shares in the UI
export function bpsToShares(weight: string): string {
  if (weight === '0') return '';
  return scale(bnum(weight), -2).toString();
}

export function sharesToBps(weight: string): BigNumber {
  return BigNumber.from(scale(weight || '0', 2).toString());
}

export function bpsToPercentage(weight: number, fNum): string {
  return fNum(scale(bnum(weight), -4).toString(), FNumFormats.percent);
}

export function formatVoteSharesWith2Decimals(weight: string) {
  if (weight === '') return '0.00';
  return numF(weight, { minimumFractionDigits: 2 });
}

export function voteLockedUntilText() {
  const unlockTime = Date.now() + WEIGHT_VOTE_DELAY;
  return format(toUtcTime(new Date(unlockTime)), 'd LLLL y');
}

export function hasUserVotes(pool: VotingPool): boolean {
  return Number(pool.userVotes) > 0;
}
