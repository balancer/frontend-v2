import { mockExpiredGauges } from '@/composables/queries/__mocks__/useExpiredGaugesQuery';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import {
  isVotingCompleted,
  setVotingCompleted,
  votingProvider,
  votingRequest,
} from './voting.provider';
import { randomAddress } from '@tests/unit/builders/address';
import { mockVotingPools } from '@/composables/queries/__mocks__/useVotingPoolsQuery';
import { aVotingPool } from '../MultiVoting/voting-pool.builders';

async function mountVoting() {
  // Reset global state before each test
  votingRequest.value = {};
  const { result } = await mountComposable(() => votingProvider());
  return result;
}

vi.mock('@/composables/queries/useExpiredGaugesQuery');
vi.mock('@/composables/queries/useVotingPoolsQuery');

const mockedExpiredGauges = [randomAddress(), randomAddress()];
mockExpiredGauges(mockedExpiredGauges);

it('Returns expired gauges', async () => {
  const { expiredGauges } = await mountVoting();

  expect(expiredGauges.value).toEqual(mockedExpiredGauges);
});

it('No selected gauge addresses by default', async () => {
  const { selectedGaugeAddresses } = await mountVoting();

  expect(selectedGaugeAddresses.value).toEqual([]);
});

it('Works when user selects a pool/gauge', async () => {
  const votingPool1 = aVotingPool();
  const votingPool2 = aVotingPool();
  mockVotingPools([votingPool1, votingPool2]);

  const {
    toggleSelection,
    selectedGaugeAddresses,
    selectedPools,
    unlockedSelectedPools,
  } = await mountVoting();

  toggleSelection(votingPool2);

  expect(selectedGaugeAddresses.value).toEqual([votingPool2.gauge.address]);
  expect(selectedPools.value).toEqual([votingPool2]);
  expect(unlockedSelectedPools.value).toEqual([votingPool2]);
});

describe('Returns unlockedSelectedPools', () => {
  it('When pool is not timeLocked', async () => {
    const oldTimestamp = 1631342418;
    const votingPool1 = aVotingPool({ lastUserVoteTime: oldTimestamp });
    mockVotingPools([votingPool1]);

    const { toggleSelection, unlockedSelectedPools } = await mountVoting();

    toggleSelection(votingPool1);

    expect(unlockedSelectedPools.value).toEqual([votingPool1]);
  });

  it('When pool is timeLocked', async () => {
    const todayTimestamp = Date.now();
    const votingPool1 = aVotingPool({ lastUserVoteTime: todayTimestamp });
    mockVotingPools([votingPool1]);

    const { toggleSelection, unlockedSelectedPools } = await mountVoting();

    toggleSelection(votingPool1);

    expect(unlockedSelectedPools.value).toEqual([]);
  });
});

describe('Returns confirmedVotingRequest', () => {
  it('When there are 2 pools selected but one of them is timeLocked', async () => {
    const oldTimestamp = 1631342418;
    const unlockedGaugeAddress = randomAddress();
    const unLockedPool = aVotingPool({
      lastUserVoteTime: oldTimestamp,
      gauge: { address: unlockedGaugeAddress },
    });
    const todayTimestamp = Date.now();
    const timeLockedPool = aVotingPool({ lastUserVoteTime: todayTimestamp });
    mockVotingPools([unLockedPool]);

    const { toggleSelection, confirmedVotingRequest } = await mountVoting();

    toggleSelection(unLockedPool);
    toggleSelection(timeLockedPool);

    expect(confirmedVotingRequest.value).toEqual([
      {
        gaugeAddress: unlockedGaugeAddress,
        weight: '',
      },
    ]);
  });
});

describe('Given that the user just completed a voting process', () => {
  it('reloads votingRequest when the vebal page reloads votingRequest', async () => {
    const votingPool1 = aVotingPool();
    const votingPools = [votingPool1, aVotingPool()];
    mockVotingPools(votingPools);

    const {
      toggleSelection,
      selectedGaugeAddresses,
      loadRequestWithExistingVotes,
    } = await mountVoting();
    toggleSelection(votingPool1);

    // User finishes voting
    setVotingCompleted();
    expect(isVotingCompleted.value).toBeTrue();

    expect(selectedGaugeAddresses.value).toEqual([votingPool1.gauge.address]);

    // vebal page reloads gauges
    loadRequestWithExistingVotes(votingPools);

    expect(selectedGaugeAddresses.value).toEqual([]);
    expect(isVotingCompleted.value).toBeFalse();
  });
});
