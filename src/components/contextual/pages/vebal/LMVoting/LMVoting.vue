<script lang="ts" setup>
import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useDebouncedRef from '@/composables/useDebouncedRed';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { poolURLFor } from '@/composables/usePoolHelpers';
import useVotingPools, { orderedTokenURIs } from '@/composables/useVotingPools';
import { bnum, scale } from '@/lib/utils';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';

import GaugesTable from './GaugesTable.vue';
import GaugeVoteModal from './GaugeVoteModal.vue';
import ResubmitVotesAlert from './ResubmitVotes/ResubmitVotesAlert.vue';
import configs, { Network } from '@/lib/config';
import GaugesFilters from './GaugesFilters.vue';
import { isGaugeExpired } from './voting-utils';

/**
 * DATA
 */
const tokenFilter = useDebouncedRef<string>('', 500);
const showExpiredGauges = useDebouncedRef<boolean>(false, 500);
const activeNetworkFilters = useDebouncedRef<Network[]>([], 500);
const activeVotingPool = ref<VotingPool | null>(null);

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
  isLoading,
  votingPools,
  votingGaugeAddresses,
  unallocatedVotes,
  votingPeriodEnd,
  votingPeriodLastHour,
  refetch: refetchVotingGauges,
} = useVotingPools();
const { fNum } = useNumbers();
const veBalLockInfoQuery = useVeBalLockInfoQuery();

const { shouldResubmitVotes } = useVotingEscrowLocks();

const { data: expiredGauges } = useExpiredGaugesQuery(votingGaugeAddresses);

/**
 * COMPUTED
 */
const unallocatedVotesFormatted = computed<string>(() =>
  fNum(scale(bnum(unallocatedVotes.value), -4).toString(), FNumFormats.percent)
);

const unallocatedVoteWeight = computed(() => {
  const totalVotes = 1e4;
  if (isLoading.value || !votingPools.value) return totalVotes;

  const votesRemaining = votingPools.value.reduce((remainingVotes, gauge) => {
    return remainingVotes - parseFloat(gauge.userVotes);
  }, totalVotes);
  return votesRemaining;
});

const hasLock = computed(
  (): boolean =>
    !!veBalLockInfoQuery.data.value?.hasExistingLock &&
    !veBalLockInfoQuery.data.value?.isExpired
);

const hasExpiredLock = computed(
  (): boolean =>
    !!veBalLockInfoQuery.data.value?.hasExistingLock &&
    veBalLockInfoQuery.data.value?.isExpired
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

/**
 * METHODS
 */
function setActiveVotingPool(votingPool: VotingPool) {
  activeVotingPool.value = votingPool;
}

function handleModalClose() {
  activeVotingPool.value = null;
  refetchVotingGauges();
}

function handleVoteSuccess() {
  refetchVotingGauges();
}

function isExpired(gauge: VotingPool) {
  return isGaugeExpired(expiredGauges.value, gauge.address);
}

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
    <ResubmitVotesAlert
      v-if="shouldResubmitVotes"
      class="mx-4 xl:mx-0 mb-7"
    ></ResubmitVotesAlert>
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
          class="mr-5"
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
      </div>
    </div>

    <GaugesTable
      :renderedRowsIdx="renderedRowsIdx"
      :expiredGauges="expiredGauges"
      :isLoading="isLoading"
      :data="filteredVotingPools"
      :noPoolsLabel="$t('noInvestments')"
      :filterText="tokenFilter"
      showPoolShares
      class="mb-8"
      @clicked-vote="setActiveVotingPool"
    />
    <div ref="intersectionSentinel" />
  </div>
  <teleport to="#modal">
    <GaugeVoteModal
      v-if="!!activeVotingPool"
      :pool="activeVotingPool"
      :isGaugeExpired="isExpired(activeVotingPool)"
      :logoURIs="orderedTokenURIs(activeVotingPool)"
      :poolURL="poolURLFor(activeVotingPool, activeVotingPool.network)"
      :unallocatedVoteWeight="unallocatedVoteWeight"
      :veBalLockInfo="veBalLockInfoQuery.data.value"
      @success="handleVoteSuccess"
      @close="handleModalClose"
    />
  </teleport>
</template>
