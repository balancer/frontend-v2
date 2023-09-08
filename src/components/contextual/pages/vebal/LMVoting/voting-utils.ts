import { FNumFormats } from '@/composables/useNumbers';
import { toUtcTime } from '@/composables/useTime';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { bnum, isSameAddress, scale } from '@/lib/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { format } from 'date-fns';

/**
 * Common pure functions used by different composables in the veBAL voting feature
 */

export function isGaugeExpired(
  expiredGauges: readonly string[] | undefined,
  gaugeAddress: string
): boolean {
  if (!expiredGauges) return false;
  return !!expiredGauges.some(item => isSameAddress(gaugeAddress, item));
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

export function voteLockedUntilText() {
  const unlockTime = Date.now() + WEIGHT_VOTE_DELAY;
  return format(toUtcTime(new Date(unlockTime)), 'd LLLL y');
}
