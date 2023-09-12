import { safeInject } from '@/providers/inject';
import {
  bpsToShares,
  hasOnlyExpiredPools,
  hasUserVotes,
  isGaugeExpired,
} from '@/components/contextual/pages/vebal/voting-utils';
import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { oneSecondInMs } from '@/composables/useTime';
import { isVotingTimeLocked } from '@/composables/useVeBAL';
import useVotingPools from '@/composables/useVotingPools';
import symbolKeys from '@/constants/symbol.keys';
import { differenceInWeeks } from 'date-fns';

import { ConfirmedVotingRequest } from '@/components/contextual/pages/vebal/MultiVoting/composables/useVotingActions';

// Global voting request shared between vebal and vebal-voting pages
export const votingRequest = ref<Record<string, string>>({});

// Controls if the votingRequest should be loaded with user votes after the first load
const isVotingRequestLoaded = ref(false);

// Controls if the votingRequest should be reloaded after a voting has been completed
export const isVotingCompleted = ref(false);

export function setVotingCompleted() {
  isVotingCompleted.value = true;
  isVotingRequestLoaded.value = false;
}

export function votingProvider() {
  /*
  STATE
  */
  const isSubmissionStep = ref(false);

  /*
  COMPOSABLES
  */
  const {
    votingPools,
    votingGaugeAddresses,
    isLoading: isLoadingVotingPools,
  } = useVotingPools();
  const { data: expiredGauges, isLoading: isLoadingExpiredGauges } =
    useExpiredGaugesQuery(votingGaugeAddresses);

  /**
   * COMPUTED
   */
  const isLoading = computed(
    () => isLoadingExpiredGauges.value || isLoadingVotingPools.value
  );

  const selectedPools = computed(() =>
    votingPools.value.filter(pool =>
      selectedGaugeAddresses.value.includes(pool.gauge.address)
    )
  );

  const unlockedSelectedPools = computed(() =>
    selectedPools.value.filter(
      pool => !isVotingTimeLocked(pool.lastUserVoteTime)
    )
  );

  const confirmedVotingRequest = computed(
    (): ConfirmedVotingRequest =>
      unlockedSelectedPools.value.map(pool => ({
        gaugeAddress: pool.gauge.address,
        weight: votingRequest.value[pool.gauge.address],
      }))
  );

  const unselectedPoolsWithVotes = computed(() =>
    votingPools.value.filter(
      pool =>
        hasUserVotes(pool) &&
        !selectedGaugeAddresses.value.includes(pool.gauge.address)
    )
  );

  const unselectedPoolsVoteWeight = computed(() =>
    unselectedPoolsWithVotes.value.reduce(
      (acc, pool) => acc + Number(bpsToShares(pool.userVotes)),
      0
    )
  );

  const selectedPoolsVoteWeight = computed((): number =>
    selectedPools.value.reduce(
      (acc, pool) => acc + Number(bpsToShares(pool.userVotes)),
      0
    )
  );

  // const selectedPoolsVoteWeight = computed(() =>
  //   Object.values(selectedPools.value).reduce(
  //     (acc, weight) => acc + Number(weight),
  //     0
  //   )
  // );

  const selectedGaugeAddresses = computed(() =>
    Object.keys(votingRequest.value)
  );

  const totalSelectedGauges = computed(
    () => selectedGaugeAddresses.value.length
  );

  const shouldBatchVotes = computed(
    () => confirmedVotingRequest.value.length > 8
  );

  const currentRequestVoteWeight = computed(() =>
    Object.values(votingRequest.value).reduce(
      (acc, weight) => acc + Number(weight),
      0
    )
  );

  // Adds:
  // - Vote weight that the user is requesting in the vebal vote page
  // - User Vote weight of pools that are not included in the current request selection
  const totalAllocatedWeight = computed(
    () => currentRequestVoteWeight.value + unselectedPoolsVoteWeight.value
  );

  const isRequestingTooMuchWeight = computed(
    () => totalAllocatedWeight.value > 100
  );

  const isRequestingZeroWeight = computed(
    () => currentRequestVoteWeight.value == 0
  );

  const isVotingRequestValid = computed(
    () => !isRequestingZeroWeight.value && !isRequestingTooMuchWeight.value
  );

  const hasSubmittedVotes = computed(() =>
    votingPools.value.some(pool => hasUserVotes(pool))
  );

  const hasExpiredPoolsSelected = computed(() =>
    unlockedSelectedPools.value.some(pool =>
      getIsGaugeExpired(pool.gauge.address)
    )
  );

  const hasTimeLockedPools = computed(() =>
    selectedPools.value.some(pool => isVotingTimeLocked(pool.lastUserVoteTime))
  );

  const hasAllVotingPowerTimeLocked = computed(
    (): boolean =>
      selectedPools.value.every(pool =>
        isVotingTimeLocked(pool.lastUserVoteTime)
      ) && selectedPoolsVoteWeight.value === 100
  );

  // const hasOnlyExpiredPoolsSelected = computed(() =>
  //   hasOnlyExpiredPools(
  //     unlockedSelectedPools.value.map(pool => pool.gauge.address),
  //     votingGaugeAddresses.value
  //   )
  // );

  /**
   * METHODS
   */
  function toggleSelection(pool: VotingPool): void {
    if (isSelected(pool)) {
      return unselectGauge(pool);
    }
    selectGauge(pool);
  }

  function selectGauge(pool: VotingPool) {
    const gaugeAddress = pool.gauge.address;
    const currentNormalizedVotes = getIsGaugeExpired(gaugeAddress)
      ? '0'
      : bpsToShares(pool.userVotes);
    votingRequest.value[gaugeAddress] = currentNormalizedVotes;
  }

  function unselectGauge(pool: VotingPool) {
    const gaugeAddress = pool.gauge.address;
    delete votingRequest.value[gaugeAddress];
  }

  function isSelected(pool: VotingPool) {
    return selectedGaugeAddresses.value.includes(pool.gauge.address);
  }

  function getIsGaugeExpired(gaugeAddress: string): boolean {
    return isGaugeExpired(expiredGauges.value, gaugeAddress);
  }

  function isInputDisabled(pool: VotingPool) {
    return (
      getIsGaugeExpired(pool.gauge.address) ||
      isVotingTimeLocked(pool.lastUserVoteTime)
    );
  }

  /*
    Once the voting data has been loaded, it initializes the votingRequest with the pools where the user already has votes
  */
  function loadRequestWithExistingVotes(votingPools: VotingPool[]) {
    if (isVotingRequestLoaded.value) return;
    votingRequest.value = {};
    votingPools.forEach(pool => {
      if (hasUserVotes(pool)) selectGauge(pool);
    });
    isVotingRequestLoaded.value = true;
    isVotingCompleted.value = false;
  }

  /*
  The MultiVoting flow is divided in 2 steps:
  1) VoteInputList: The user fills the votingRequest through the list of voting inputs
  2) VoteSubmission: Once the clicks "Next", the inputs are replaced by read-only fields and we render VotingActions to execute the voting transaction/s

  This function goes from 1) to 2)
  */
  function goToSubmissionStep() {
    isSubmissionStep.value = true;
  }

  return {
    expiredGauges,
    selectedGaugeAddresses,
    selectedPools,
    unlockedSelectedPools,
    unselectedPoolsWithVotes,
    unselectedPoolsVoteWeight,
    votingRequest,
    isLoading,
    isLoadingExpiredGauges,
    isLoadingVotingPools,
    currentRequestVoteWeight,
    totalAllocatedWeight,
    isRequestingZeroWeight,
    isRequestingTooMuchWeight,
    isVotingRequestValid,
    totalSelectedGauges,
    hasSubmittedVotes,
    shouldBatchVotes,
    isSubmissionStep,
    hasExpiredPoolsSelected,
    hasAllVotingPowerTimeLocked,
    // hasOnlyExpiredPoolsSelected,
    hasTimeLockedPools,
    confirmedVotingRequest,
    getIsGaugeExpired,
    toggleSelection,
    isSelected,
    isInputDisabled,
    loadRequestWithExistingVotes,
    goToSubmissionStep,
  };
}

export type VotingProviderResponse = ReturnType<typeof votingProvider>;
export const VotingProviderSymbol: InjectionKey<VotingProviderResponse> =
  Symbol(symbolKeys.Providers.Voting);

export function provideVoting(): VotingProviderResponse {
  const _provider = votingProvider();
  provide(VotingProviderSymbol, _provider);
  return _provider;
}

export function useVoting(): VotingProviderResponse {
  return safeInject(VotingProviderSymbol);
}
