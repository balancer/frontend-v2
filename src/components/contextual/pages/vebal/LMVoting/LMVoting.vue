<script lang="ts" setup>
import { computed, ref } from 'vue';

import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import useDebouncedRef from '@/composables/useDebouncedRed';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { poolURLFor } from '@/composables/usePool';
import useVotingGauges from '@/composables/useVotingGauges';
import { bnum, isSameAddress, scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';

import GaugesTable from './GaugesTable.vue';
import GaugeVoteModal from './GaugeVoteModal.vue';
import ResubmitVotesAlert from './ResubmitVotes/ResubmitVotesAlert.vue';
import { orderedTokenURIs } from '@/composables/useVotingGauges';
import { Network } from '@balancer-labs/sdk';
import GaugesFilters from './GaugesFilters.vue';

/**
 * DATA
 */
const tokenFilter = useDebouncedRef<string>('', 500);
const showExpiredGauges = useDebouncedRef<boolean>(false, 500);
const activeNetworkFilters = useDebouncedRef<Network[]>([], 500);
const activeVotingGauge = ref<VotingGaugeWithVotes | null>(null);

const networkFilters = [
  Network.MAINNET,
  Network.POLYGON,
  Network.ARBITRUM,
  Network.OPTIMISM,
];

/**
 * COMPOSABLES
 */
const {
  isLoading,
  votingGauges,
  unallocatedVotes,
  votingPeriodEnd,
  votingPeriodLastHour,
  refetch: refetchVotingGauges,
} = useVotingGauges();
const { fNum2 } = useNumbers();
const veBalLockInfoQuery = useVeBalLockInfoQuery();

const { shouldResubmitVotes } = useVotingEscrowLocks();

const votingGaugeAddresses = computed<string[]>(
  () => votingGauges.value?.map(gauge => gauge.address) || []
);
const { data: expiredGauges } = useExpiredGaugesQuery(votingGaugeAddresses);

/**
 * COMPUTED
 */
const unallocatedVotesFormatted = computed<string>(() =>
  fNum2(scale(bnum(unallocatedVotes.value), -4).toString(), FNumFormats.percent)
);

const unallocatedVoteWeight = computed(() => {
  const totalVotes = 1e4;
  if (isLoading.value || !votingGauges.value) return totalVotes;

  const votesRemaining = votingGauges.value.reduce((remainingVotes, gauge) => {
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

const gaugesTableKey = computed(() => JSON.stringify(isLoading.value));

const gaugesFilteredByExpiring = computed(() => {
  if (showExpiredGauges.value) {
    return votingGauges.value;
  }

  return votingGauges.value.filter(gauge => {
    if (Number(gauge.userVotes) > 0) {
      return true;
    }
    return !expiredGauges.value?.some(expGauge =>
      isSameAddress(expGauge, gauge.address)
    );
  });
});

const filteredVotingGauges = computed(() => {
  // put filter by expiring in separate computed to maintain readability
  return gaugesFilteredByExpiring.value.filter(gauge => {
    let showByNetwork = true;
    if (
      activeNetworkFilters.value.length > 0 &&
      !activeNetworkFilters.value.includes(gauge.network)
    ) {
      showByNetwork = false;
    }

    return (
      showByNetwork &&
      gauge.pool.tokens.some(token => {
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
function setActiveGaugeVote(votingGauge: VotingGaugeWithVotes) {
  activeVotingGauge.value = votingGauge;
}

function handleModalClose() {
  activeVotingGauge.value = null;
  refetchVotingGauges.value();
}

function handleVoteSuccess() {
  refetchVotingGauges.value();
}
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
      :key="gaugesTableKey"
      :expiredGauges="expiredGauges"
      :isLoading="isLoading"
      :data="filteredVotingGauges"
      :noPoolsLabel="$t('noInvestments')"
      :filterText="tokenFilter"
      showPoolShares
      class="mb-8"
      @clicked-vote="setActiveGaugeVote"
    />
  </div>
  <teleport to="#modal">
    <GaugeVoteModal
      v-if="!!activeVotingGauge"
      :gauge="activeVotingGauge"
      :logoURIs="orderedTokenURIs(activeVotingGauge)"
      :poolURL="poolURLFor(activeVotingGauge.pool, activeVotingGauge.network)"
      :unallocatedVoteWeight="unallocatedVoteWeight"
      :veBalLockInfo="veBalLockInfoQuery.data.value"
      @success="handleVoteSuccess"
      @close="handleModalClose"
    />
  </teleport>
</template>
