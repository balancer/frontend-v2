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
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';

async function mountVoting() {
  // Reset global state before each test
  votingRequest.value = {};
  setVotingCompleted();
  const { result } = await mountComposable(() => votingProvider());
  return result;
}

initDependenciesWithDefaultMocks();

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

it('Works when user selects/unselects a pool/gauge', async () => {
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

  // Unselects
  toggleSelection(votingPool2);
  expect(selectedGaugeAddresses.value).toEqual([]);
  expect(selectedPools.value).toEqual([]);
  expect(unlockedSelectedPools.value).toEqual([]);
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

  it('Ordered by weight', async () => {
    const gaugeAddress1 = 'foo';
    const pool1 = aVotingPool({
      gauge: { address: gaugeAddress1 },
    });

    const gaugeAddress2 = 'bar';
    const pool2 = aVotingPool({
      gauge: { address: gaugeAddress2 },
    });
    const gaugeAddress3 = 'baz';
    const pool3 = aVotingPool({
      gauge: { address: gaugeAddress3 },
    });
    mockVotingPools([pool1, pool2, pool3]);

    const { confirmedVotingRequest, toggleSelection } = await mountVoting();

    toggleSelection(pool1);
    toggleSelection(pool2);
    toggleSelection(pool3);

    votingRequest.value[gaugeAddress1] = '20';
    votingRequest.value[gaugeAddress2] = '0';
    votingRequest.value[gaugeAddress3] = '15';

    expect(confirmedVotingRequest.value).toEqual([
      {
        gaugeAddress: gaugeAddress2,
        weight: '0',
      },
      {
        gaugeAddress: gaugeAddress3,
        weight: '15',
      },
      {
        gaugeAddress: gaugeAddress1,
        weight: '20',
      },
    ]);
  });

  it('Ordered by weight when one of the pools had existing votes', async () => {
    const gaugeAddress1 = 'foo';
    const pool1 = aVotingPool({
      gauge: { address: gaugeAddress1 },
      userVotes: '0',
    });

    const gaugeAddress2 = 'bar';
    const pool2 = aVotingPool({
      gauge: { address: gaugeAddress2 },
      userVotes: '10000', //100% weight
    });

    mockVotingPools([pool1, pool2]);

    const { confirmedVotingRequest, toggleSelection } = await mountVoting();

    toggleSelection(pool1);
    toggleSelection(pool2);

    votingRequest.value[gaugeAddress1] = '20';
    votingRequest.value[gaugeAddress2] = '50';

    /*
     gaugeAddress1 weight is the smallest (20%) but
     gaugeAddress2 vote must come first because weight is updating from 100% to 50%
    */
    expect(confirmedVotingRequest.value).toEqual([
      {
        gaugeAddress: gaugeAddress2,
        weight: '50',
      },
      {
        gaugeAddress: gaugeAddress1,
        weight: '20',
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

describe('hasAllVotingPowerTimeLocked', () => {
  it('when the user only has timeLocked pools with a total weight of 100%', async () => {
    const todayTimestamp = Date.now();
    const timeLockedPool1 = aVotingPool({
      userVotes: '6000',
      lastUserVoteTime: todayTimestamp,
    }); // 6000 bps = 60% votes

    const timeLockedPool2 = aVotingPool({
      userVotes: '4000',
      lastUserVoteTime: todayTimestamp,
    }); // 4000 bps = 40% votes

    const votingPools = [timeLockedPool1, timeLockedPool2];
    mockVotingPools(votingPools);

    const { hasAllVotingPowerTimeLocked, loadRequestWithExistingVotes } =
      await mountVoting();

    loadRequestWithExistingVotes(votingPools);
    expect(hasAllVotingPowerTimeLocked.value).toBeTrue();
  });

  it('when the user only has timeLocked pools with total weight < 100%', async () => {
    const todayTimestamp = Date.now();
    const timeLockedPool1 = aVotingPool({
      userVotes: '5000',
      lastUserVoteTime: todayTimestamp,
    }); // 5000 bps = 50% votes

    const timeLockedPool2 = aVotingPool({
      userVotes: '4000',
      lastUserVoteTime: todayTimestamp,
    }); // 4000 bps = 40% votes

    const votingPools = [timeLockedPool1, timeLockedPool2];
    mockVotingPools(votingPools);

    const { hasAllVotingPowerTimeLocked, loadRequestWithExistingVotes } =
      await mountVoting();

    loadRequestWithExistingVotes(votingPools);
    expect(hasAllVotingPowerTimeLocked.value).toBeFalse();
  });
});

it('isInputDisabled', async () => {
  const unlockedVotingPool = aVotingPool();

  const todayTimestamp = Date.now();
  const timeLockedPool = aVotingPool({
    lastUserVoteTime: todayTimestamp,
  });

  const expiredPool = aVotingPool({ gauge: { isKilled: true } });

  const votingPools = [unlockedVotingPool, timeLockedPool, expiredPool];
  mockVotingPools(votingPools);

  const { isInputDisabled } = await mountVoting();

  expect(isInputDisabled(unlockedVotingPool)).toBeFalse();
  expect(isInputDisabled(timeLockedPool)).toBeTrue();
  expect(isInputDisabled(expiredPool)).toBeTrue();
});

describe('isVotingRequestValid', () => {
  it('when it has an expired pool with user votes', async () => {
    const expiredPool = aVotingPool({
      userVotes: '1000',
      gauge: { address: randomAddress(), isKilled: true },
    });

    const votingPools = [expiredPool, aVotingPool()];
    mockVotingPools(votingPools);

    const { isVotingRequestValid, toggleSelection } = await mountVoting();

    toggleSelection(expiredPool);

    expect(isVotingRequestValid.value).toBeTrue();
  });

  it('when it has an expired pool without user votes', async () => {
    const expiredPool = aVotingPool({
      userVotes: '0',
      gauge: { address: randomAddress(), isKilled: true },
    });

    const votingPools = [expiredPool, aVotingPool()];
    mockVotingPools(votingPools);

    const { isVotingRequestValid, toggleSelection } = await mountVoting();

    toggleSelection(expiredPool);

    expect(isVotingRequestValid.value).toBeTrue();
  });

  it('when the user selected over 100% weight', async () => {
    const expiredPool = aVotingPool({
      userVotes: '5000',
      gauge: { address: randomAddress(), isKilled: true },
    });
    const votingPool = aVotingPool({
      userVotes: '51000',
    });

    const votingPools = [expiredPool, votingPool];
    mockVotingPools(votingPools);

    const { isVotingRequestValid, toggleSelection } = await mountVoting();

    toggleSelection(expiredPool);
    toggleSelection(votingPool);

    expect(isVotingRequestValid.value).toBeFalse();
  });

  it('when the user did not enter any weight', async () => {
    const votingPool = aVotingPool({ userVotes: '0' });

    const votingPools = [votingPool];
    mockVotingPools(votingPools);

    const { isVotingRequestValid, toggleSelection } = await mountVoting();

    toggleSelection(votingPool);

    expect(isVotingRequestValid.value).toBeFalse();
  });
});
