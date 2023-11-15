import {
  aVotingPool,
  toOnchainVotesNextPeriod,
} from '@/components/contextual/pages/vebal/MultiVoting/voting-pool.builders';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { oneDayInMs, toUnixTimestamp } from '@/composables/useTime';
import { POOLS } from '@/constants/pools';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposableWithDefaultTokensProvider as mountComposable } from '@tests/mount-helpers';
import { useVotingWarnings } from './useVotingWarnings';

function mountVotingWarnings(votingPool: VotingPool) {
  const { result } = mountComposable(() => useVotingWarnings(votingPool));
  return result;
}

initDependenciesWithDefaultMocks();

describe('lpVoteOverLimitWarning', () => {
  test('when next LP period votes are lesser than current gauge votes', () => {
    const votingPool = aVotingPool({
      votesNextPeriod: toOnchainVotesNextPeriod('0.19'),
      gauge: { relativeWeightCap: '0.2' },
    });
    const { lpVoteOverLimitWarning } = mountVotingWarnings(votingPool);
    expect(lpVoteOverLimitWarning.value).toBeNull();
  });

  test('when next LP period votes are greater than current gauge votes', () => {
    const votingPool = aVotingPool({
      votesNextPeriod: toOnchainVotesNextPeriod('0.21'),
      gauge: { relativeWeightCap: '0.2' },
    });
    const { lpVoteOverLimitWarning } = mountVotingWarnings(votingPool);
    expect(lpVoteOverLimitWarning.value).toEqual({
      description:
        'Distributions to LPs of this pool gauge are capped at 20%. Any votes exceeding this amount at Thursday 0:00 UTC will not be counted.',
      title: 'You may be wasting your vote',
    });
  });

  test('when next LP period votes are greater than vebal gauge votes (0.10)', () => {
    const veBalPool = aVotingPool({
      id: POOLS.IdsMap?.veBAL,
      votesNextPeriod: toOnchainVotesNextPeriod('0.11'),
    });
    const { lpVoteOverLimitWarning } = mountVotingWarnings(veBalPool);
    expect(lpVoteOverLimitWarning.value).toEqual({
      description:
        'Distributions to veBAL holders of weekly emissions are capped at 10%. Any votes exceeding this amount at Thursday 0:00 UTC will not be counted.',
      title: 'You may be wasting your vote: veBAL cap hit',
    });
  });
});

describe('votedToRecentlyWarning', () => {
  function daysAgo(daysAgo: number) {
    return toUnixTimestamp(Date.now() - daysAgo * oneDayInMs);
  }

  test('when user voted 11 days ago', () => {
    const pool = aVotingPool({
      lastUserVoteTime: daysAgo(11),
    });
    const { timeLockedVoteWarning: votedToRecentlyWarning } =
      mountVotingWarnings(pool);
    expect(votedToRecentlyWarning.value).toBeNull();
  });

  test('when user voted 9 days ago', () => {
    const pool = aVotingPool({
      lastUserVoteTime: daysAgo(9),
    });
    const { timeLockedVoteWarning: votedToRecentlyWarning } =
      mountVotingWarnings(pool);
    expect(votedToRecentlyWarning.value).toEqual({
      description:
        "You won't be able to make any edits to this vote allocation for 1 day",
      title: 'Votes are locked for 10 days',
    });
  });

  test('when user voted 9 and a half days ago', () => {
    const pool = aVotingPool({
      lastUserVoteTime: daysAgo(9.5),
    });
    const { timeLockedVoteWarning: votedToRecentlyWarning } =
      mountVotingWarnings(pool);
    expect(votedToRecentlyWarning.value).toEqual({
      description:
        "You won't be able to make any edits to this vote allocation for about 12 hours",
      title: 'Votes are locked for 10 days',
    });
  });
});
