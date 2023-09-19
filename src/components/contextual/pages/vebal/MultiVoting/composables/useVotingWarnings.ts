import { bnum, scale } from '@/lib/utils';

import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import {
  isVotingTimeLocked,
  remainingVoteLockTime,
} from '@/composables/useVeBAL';
import { isVeBalPool } from '@/composables/usePoolHelpers';

export function useVotingWarnings(pool: VotingPool) {
  const isVeBalGauge = isVeBalPool(pool.id);

  // Is votes next period value above voting cap?
  const votesNextPeriodOverCap = computed((): boolean => {
    const gaugeVoteWeightNormalized = scale(pool.votesNextPeriod, -18);
    if (isVeBalGauge) {
      const veBalMaxVotingWeight = '0.1';
      return gaugeVoteWeightNormalized.gte(bnum(veBalMaxVotingWeight));
    }
    if (!pool.gauge.relativeWeightCap) return false;

    return gaugeVoteWeightNormalized.gte(bnum(pool.gauge.relativeWeightCap));
  });

  const lpVoteOverLimitWarning = computed(() => {
    const formattedGaugeVoteCap = (
      Number(pool.gauge.relativeWeightCap) * 100
    ).toFixed();

    if (votesNextPeriodOverCap.value) {
      if (isVeBalGauge) {
        return {
          title: 'You may be wasting your vote: veBAL cap hit',
          description:
            'Distributions to veBAL holders of weekly emissions are capped at 10%. Any votes exceeding this amount at Thursday 0:00 UTC will not be counted.',
        };
      } else {
        return {
          title: 'You may be wasting your vote',
          description: `Distributions to LPs of this pool gauge are capped at ${formattedGaugeVoteCap}%. Any votes exceeding this amount at Thursday 0:00 UTC will not be counted.`,
        };
      }
    }

    return null;
  });

  const timeLockedVoteWarning = computed(() => {
    if (isVotingTimeLocked(pool.lastUserVoteTime)) {
      const remainingTime = remainingVoteLockTime(pool.lastUserVoteTime);
      return {
        title: 'Votes are locked for 10 days',
        description: `You won't be able to make any edits to this vote allocation for ${remainingTime}`,
      };
    }
    return null;
  });

  return {
    lpVoteOverLimitWarning,
    timeLockedVoteWarning,
  };
}
