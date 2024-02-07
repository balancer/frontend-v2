import { safeInject } from '@/providers/inject';
import {
  bpsToShares,
  hasUserVotes,
  isGaugeExpired,
  isPoolExpired,
} from '@/components/contextual/pages/vebal/voting-utils';
import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { isVotingTimeLocked } from '@/composables/useVeBAL';
import useVotingPools from '@/composables/useVotingPools';
import symbolKeys from '@/constants/symbol.keys';

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
    isLoadingVotingPools,
    isRefetchingVotingPools,
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

  /***
   * Order by weight increment (from smallest to largest)
   * to avoid going above max voting power when multi-voting in the contract,
   * where weight increment for a given pool is the difference between the old exiting weight and the new requested weight
   */
  const unlockedSelectedPoolsOrderedByWeight = computed(() =>
    unlockedSelectedPools.value.sort((a, b) => {
      const oldWeightA = Number(bpsToShares(a.userVotes));
      const newWeightA = parseFloat(votingRequest.value[a.gauge.address]);
      const weightIncrementA = newWeightA - oldWeightA;

      const oldWeightB = Number(bpsToShares(b.userVotes));
      const newWeightB = parseFloat(votingRequest.value[b.gauge.address]);
      const weightIncrementB = newWeightB - oldWeightB;

      return weightIncrementA - weightIncrementB;
    })
  );

  const confirmedVotingRequest = computed(
    (): ConfirmedVotingRequest =>
      unlockedSelectedPoolsOrderedByWeight.value.map(pool => ({
        gaugeAddress: pool.gauge.address,
        weight: votingRequest.value[pool.gauge.address],
      }))
  );

  const selectedPoolsVoteWeight = computed((): number =>
    selectedPools.value.reduce(
      (acc, pool) => acc + Number(bpsToShares(pool.userVotes)),
      0
    )
  );

  const selectedGaugeAddresses = computed(() =>
    Object.keys(votingRequest.value)
  );

  const totalSelectedGauges = computed(
    () => selectedGaugeAddresses.value.length
  );

  const shouldBatchVotes = computed(
    () => confirmedVotingRequest.value.length > 8
  );

  const totalAllocatedWeight = computed(() =>
    Object.values(votingRequest.value).reduce(
      (acc, weight) => acc + Number(weight),
      0
    )
  );

  const isRequestingTooMuchWeight = computed(
    () => totalAllocatedWeight.value > 100
  );

  const hasUserEnteredVotes = computed(() => {
    return unlockedSelectedPools.value.some(pool => {
      return (
        votingRequest.value[pool.gauge.address] != '' &&
        !getIsGaugeExpired(pool.gauge.address)
      );
    });
  });

  const isVotingRequestValid = computed(
    () =>
      !isRequestingTooMuchWeight.value &&
      (hasExpiredPoolsWithUserVotesSelected.value || hasUserEnteredVotes.value)
  );

  const hasSubmittedVotes = computed(() =>
    votingPools.value.some(pool => hasUserVotes(pool))
  );

  const hasExpiredPoolsSelected = computed(() =>
    unlockedSelectedPools.value.some(pool => isPoolExpired(pool))
  );

  const hasExpiredPoolsWithUserVotesSelected = computed(() => {
    return unlockedSelectedPools.value.some(
      pool => isPoolExpired(pool) && hasUserVotes(pool)
    );
  });

  const hasTimeLockedPools = computed(() =>
    selectedPools.value.some(pool => isVotingTimeLocked(pool.lastUserVoteTime))
  );

  const hasAllVotingPowerTimeLocked = computed(
    (): boolean =>
      selectedPools.value.every(pool =>
        isVotingTimeLocked(pool.lastUserVoteTime)
      ) && selectedPoolsVoteWeight.value === 100
  );

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
    const currentNormalizedVotes = isPoolExpired(pool)
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
    return isPoolExpired(pool) || isVotingTimeLocked(pool.lastUserVoteTime);
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
    votingRequest,
    isLoading,
    isLoadingExpiredGauges,
    isLoadingVotingPools,
    isRefetchingVotingPools,
    totalAllocatedWeight,
    isRequestingTooMuchWeight,
    isVotingRequestValid,
    totalSelectedGauges,
    hasSubmittedVotes,
    shouldBatchVotes,
    isSubmissionStep,
    hasExpiredPoolsSelected,
    hasAllVotingPowerTimeLocked,
    hasTimeLockedPools,
    confirmedVotingRequest,
    isVotingRequestLoaded,
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
