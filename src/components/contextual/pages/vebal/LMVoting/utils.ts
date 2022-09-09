import { orderedPoolTokens } from '@/composables/usePool';
import { toJsTimestamp } from '@/composables/useTime';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { formatDistanceToNow } from 'date-fns';

export function getNextAllowedTimeToVote(
  lastUserVoteTime: number
): string | null {
  const jsTimestamp = toJsTimestamp(lastUserVoteTime);
  if (Date.now() < jsTimestamp + WEIGHT_VOTE_DELAY) {
    const remainingTime = formatDistanceToNow(jsTimestamp + WEIGHT_VOTE_DELAY);
    return remainingTime;
  }
  return null;
}

export function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(
    gauge.pool.poolType,
    gauge.pool.address,
    gauge.pool.tokens
  );
  return sortedTokens.map(
    token => gauge.tokenLogoURIs[token?.address || ''] || ''
  );
}
