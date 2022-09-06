import { toJsTimestamp } from '@/composables/useTime';
import { WEIGHT_VOTE_DELAY } from '@/constants/gauge-controller';
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
