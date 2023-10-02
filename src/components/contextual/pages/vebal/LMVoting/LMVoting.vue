<script lang="ts" setup>
import useDebouncedRef from '@/composables/useDebouncedRed';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useVotingPools from '@/composables/useVotingPools';

import useNetwork from '@/composables/useNetwork';
import useVeBal from '@/composables/useVeBAL';
import { useVeBalLockInfo } from '@/composables/useVeBalLockInfo';
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import useWeb3 from '@/services/web3/useWeb3';
import GaugesFilters from './GaugesFilters.vue';
import GaugesTable from './GaugesTable.vue';
import VotingAlert from './VotingAlert.vue';
import { bpsToPercentage, isGaugeExpired } from '../voting-utils';
import useNumbers from '@/composables/useNumbers';
import { isVotingCompleted, useVoting } from '../providers/voting.provider';

/**
 * COMPOSABLES
 */
const router = useRouter();

/**
 * DATA
 */

const tokenFilter = useDebouncedRef<string>('', 500);
const showExpiredGauges = useDebouncedRef<boolean>(false, 500);
const activeNetworkFilters = useDebouncedRef<Network[]>(
  getDefaultActiveNetworkFilter(),
  500
);

const networkFilters: Network[] = Object.entries(configs)
  .filter(details => {
    const config = details[1];
    return (
      !config.testNetwork && config.pools.Stakable.VotingGaugePools.length > 0
    );
  })
  .map(details => Number(details[0]) as Network);

/**
 * COMPOSABLES
 */
const {
  votingPools,
  unallocatedVotes,
  votingPeriodEnd,
  votingPeriodLastHour,
  isRefetchingVotingPools,
} = useVotingPools();
const { veBalLockTooShort, veBalExpired, hasLock, hasExpiredLock } =
  useVeBalLockInfo();

const { shouldResubmitVotes } = useVotingEscrowLocks();
const { networkSlug } = useNetwork();
const { isWalletReady, isMismatchedNetwork } = useWeb3();

const { hasVeBalBalance, noVeBalBalance } = useVeBal();
const { fNum } = useNumbers();
const {
  isLoading,
  isLoadingVotingPools,
  expiredGauges,
  unlockedSelectedPools,
  hasSubmittedVotes,
  hasAllVotingPowerTimeLocked,
  loadRequestWithExistingVotes,
} = useVoting();

/**
 * COMPUTED
 */
const unallocatedVotesFormatted = computed<string>(() =>
  bpsToPercentage(unallocatedVotes.value, fNum)
);

const poolsFilteredByExpiring = computed(() => {
  if (showExpiredGauges.value) {
    return votingPools.value;
  }

  return votingPools.value.filter(pool => {
    if (Number(pool.userVotes) > 0) {
      return true;
    }
    return !isGaugeExpired(expiredGauges.value, pool.gauge.address);
  });
});

const filteredVotingPools = computed(() => {
  // put filter by expiring in separate computed to maintain readability
  return poolsFilteredByExpiring.value.filter(pool => {
    let showByNetwork = true;
    if (
      activeNetworkFilters.value.length > 0 &&
      !activeNetworkFilters.value.includes(pool.network)
    ) {
      showByNetwork = false;
    }

    return (
      showByNetwork &&
      pool.tokens.some(token => {
        return token.symbol
          ?.toLowerCase()
          .includes(tokenFilter.value.toLowerCase());
      })
    );
  });
});

const selectVotesDisabled = computed(
  (): boolean =>
    isLoading.value ||
    !hasVeBalBalance.value ||
    hasAllVotingPowerTimeLocked.value
);

const votingDisabled = computed(
  () =>
    selectVotesDisabled.value ||
    unlockedSelectedPools.value.length === 0 ||
    isMismatchedNetwork.value
);

/**
 * METHODS
 */
const intersectionSentinel = ref<HTMLDivElement | null>(null);
const renderedRowsIdx = ref(40);
let observer: IntersectionObserver | undefined;
function addIntersectionObserver(): void {
  if (
    !('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !intersectionSentinel.value
  ) {
    renderedRowsIdx.value = votingPools.value.length;
    return;
  }
  const options = {
    rootMargin: '0% 0% 50% 0%',
  };
  const callback = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        renderedRowsIdx.value += 40;
      }
    });
  };
  observer = new IntersectionObserver(callback, options);
  observer.observe(intersectionSentinel.value);
}

function getDefaultActiveNetworkFilter() {
  const param = router.currentRoute.value.query.chain;
  if (!param || typeof param !== 'string') {
    return [];
  }

  const networkToFilter = Network[param.toUpperCase()];
  if (!networkToFilter) {
    return [];
  }

  return [networkToFilter];
}

onMounted(() => {
  addIntersectionObserver();
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
watch(
  () => [showExpiredGauges.value, activeNetworkFilters.value],
  () => {
    renderedRowsIdx.value = votingPools.value.length;
  },
  { deep: true }
);

watch(isLoading, async () => {
  // Load votingRequest once the voting list and the expired gauges were loaded
  loadRequestWithExistingVotes(votingPools.value);
});
watch(isRefetchingVotingPools, async () => {
  // Reload votingRequest if refetching after coming back from a successful voting
  if (isVotingCompleted.value) {
    loadRequestWithExistingVotes(votingPools.value);
  }
});
</script>

<template>
  <div class="flex flex-col">
    <div
      class="flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-end"
    >
      <div class="px-4 xl:px-0 pb-2 max-w-3xl">
        <h3 class="mb-2">
          {{ $t('veBAL.liquidityMining.title') }}
          <BalTooltip
            :text="$t('veBAL.liquidityMining.description')"
            iconSize="sm"
            iconClass="text-gray-400 dark:text-gray-600"
            width="72"
            class="mt-1"
          />
        </h3>
      </div>
    </div>

    <VotingAlert v-if="veBalLockTooShort" title="veBAL not locked for 7 days">
      You must have veBAL locked for more than 7 days to vote on gauges.
    </VotingAlert>

    <VotingAlert
      v-if="shouldResubmitVotes"
      title="Resubmit your votes to utilize your full voting power"
    >
      Votes on pools are set at the time of the vote. Since you’ve added new
      veBAL since your original vote, you have additional voting power which is
      not being used. Use the 'Edit votes' button to resubmit your votes.
    </VotingAlert>

    <VotingAlert
      v-if="noVeBalBalance && !isLoading"
      title="You need some veBAL to vote on gauges"
    >
      Get veBAL by locking up LP tokens from the 80% BAL / 20% WETH pool.
    </VotingAlert>

    <VotingAlert
      v-if="veBalExpired"
      title="You can't vote because your veBAL has expired"
    >
      You need some veBAL to vote on gauges. Unlock and relock your
      B-80BAL-20-WETH to get some veBAL.
    </VotingAlert>

    <VotingAlert
      v-if="hasAllVotingPowerTimeLocked"
      title="100% of your votes are locked"
    >
      You won't be able to make any edits until some of them are unlocked.
    </VotingAlert>

    <div class="flex flex-wrap justify-between items-end px-4 lg:px-0">
      <div class="flex gap-2 xs:gap-3 mb-3 lg:mb-0">
        <BalCard shadow="none" class="p-0 md:w-48 min-w-max">
          <div class="flex items-center">
            <p class="inline mr-1 text-sm text-secondary">
              My unallocated votes
            </p>
            <BalTooltip
              :text="$t('veBAL.liquidityMining.myUnallocatedVotesTooltip')"
              iconClass="text-gray-400 dark:text-gray-600"
              iconSize="sm"
              width="72"
              class="mt-1"
            />
          </div>
          <p
            class="inline mr-1 text-lg font-semibold"
            :class="{ 'text-red-500': hasExpiredLock }"
          >
            <span v-if="hasLock">
              {{ unallocatedVotesFormatted }}
            </span>
            <span v-else class="mr-1">—</span>
          </p>
          <BalTooltip
            v-if="hasExpiredLock"
            :text="$t('veBAL.liquidityMining.votingPowerExpiredTooltip')"
            iconSize="sm"
            :iconName="'alert-triangle'"
            :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
            width="72"
            class="relative top-0.5"
          />
        </BalCard>
        <BalCard shadow="none" class="md:w-48 min-w-max">
          <div class="flex items-center">
            <p
              :class="{ 'text-orange-500 font-medium': votingPeriodLastHour }"
              class="inline mr-1 text-sm text-secondary"
            >
              Voting period ends
            </p>
            <BalTooltip
              :text="$t('veBAL.liquidityMining.votingPeriodTooltip')"
              iconSize="sm"
              iconClass="text-gray-400 dark:text-gray-600"
              width="72"
              class="mt-1"
            />
          </div>
          <p class="text-lg font-semibold tabular-nums">
            <span
              v-if="votingPeriodEnd.length"
              :class="{ 'text-orange-500': votingPeriodLastHour }"
            >
              {{
                $t(
                  'veBAL.liquidityMining.votingPeriodCountdown',
                  votingPeriodEnd
                )
              }}
            </span>
          </p>
        </BalCard>
      </div>
      <div class="flex mb-3 lg:mb-0">
        <BalTextInput
          v-model="tokenFilter"
          class="mr-5 b-5"
          name="tokenSearch"
          type="text"
          :placeholder="$t('filterByToken')"
          size="sm"
        >
          <template #prepend>
            <div class="flex items-center h-full">
              <BalIcon name="search" size="md" class="px-2 text-gray-600" />
            </div>
          </template>
        </BalTextInput>
        <GaugesFilters
          :networkFilters="networkFilters"
          :showExpiredGauges="showExpiredGauges"
          :activeNetworkFilters="activeNetworkFilters"
          @update:show-expired-gauges="showExpiredGauges = $event"
          @update:active-network-filters="activeNetworkFilters = $event"
        />
        <div v-if="isWalletReady" class="flex-0 ml-5 w-32 h-8">
          <BalBtn
            :tag="votingDisabled ? 'div' : 'router-link'"
            :to="{ name: 'vebal-voting', params: { networkSlug } }"
            :label="hasSubmittedVotes ? 'Edit votes' : 'Vote'"
            color="gradient"
            :disabled="votingDisabled"
            block
          />
        </div>
      </div>
    </div>

    <GaugesTable
      :renderedRowsIdx="renderedRowsIdx"
      :isLoading="isLoadingVotingPools"
      :data="filteredVotingPools"
      :noPoolsLabel="$t('noInvestments')"
      :filterText="tokenFilter"
      :selectVotesDisabled="selectVotesDisabled"
    />
    <div ref="intersectionSentinel" />
  </div>
</template>
