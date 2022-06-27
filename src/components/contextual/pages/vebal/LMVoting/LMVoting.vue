<script lang="ts" setup>
import { computed, ref } from 'vue';

import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { orderedPoolTokens, poolURLFor } from '@/composables/usePool';
import useVotingGauges from '@/composables/useVotingGauges';
import { bnum, scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';

import GaugesTable from './GaugesTable.vue';
import GaugeVoteModal from './GaugeVoteModal.vue';

/**
 * DATA
 */
const activeVotingGauge = ref<VotingGaugeWithVotes | null>(null);

/**
 * COMPOSABLES
 */
const {
  isLoading,
  votingGauges,
  unallocatedVotes,
  votingPeriodEnd,
  votingPeriodLastHour,
  refetch: refetchVotingGauges
} = useVotingGauges();
const { fNum2 } = useNumbers();
const veBalLockInfoQuery = useVeBalLockInfoQuery();

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

/**
 * METHODS
 */
function setActiveGaugeVote(votingGauge: VotingGaugeWithVotes) {
  activeVotingGauge.value = votingGauge;
}

function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(
    gauge.pool.poolType,
    gauge.pool.address,
    gauge.pool.tokens
  );
  return sortedTokens.map(
    token => gauge.tokenLogoURIs[token?.address || ''] || ''
  );
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
  <div
    class="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-2 gap-4"
  >
    <div class="max-w-3xl">
      <h3 class="mb-2">{{ $t('veBAL.liquidityMining.title') }}</h3>
      <p class="">{{ $t('veBAL.liquidityMining.description') }}</p>
    </div>
    <div class="flex gap-2 xs:gap-3">
      <BalCard shadow="none" class="min-w-max md:w-48">
        <div class="flex items-center">
          <p class="text-sm text-gray-500 inline mr-1">
            My unallocated votes
          </p>
          <BalTooltip
            :text="$t('veBAL.liquidityMining.myUnallocatedVotesTooltip')"
            iconClass="text-gray-400 dark:text-gray-600"
            icon-size="sm"
            width="72"
            class="mt-1"
          />
        </div>
        <p
          class="text-lg font-semibold inline mr-1"
          :class="{ 'text-red-500': hasExpiredLock }"
        >
          <span v-if="hasLock">
            {{ unallocatedVotesFormatted }}
          </span>
          <span class="mr-1" v-else>—</span>
        </p>
        <BalTooltip
          v-if="hasExpiredLock"
          :text="$t('veBAL.liquidityMining.votingPowerExpiredTooltip')"
          icon-size="sm"
          :icon-name="'alert-triangle'"
          :icon-class="
            'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'
          "
          width="72"
          class="relative top-0.5"
        />
      </BalCard>
      <BalCard shadow="none" class="min-w-max md:w-48">
        <div class="flex items-center">
          <p
            :class="{ 'text-orange-500 font-medium': votingPeriodLastHour }"
            class="text-sm text-gray-500 inline mr-1"
          >
            Voting period ends
          </p>
          <BalTooltip
            :text="$t('veBAL.liquidityMining.votingPeriodTooltip')"
            icon-size="sm"
            iconClass="text-gray-400 dark:text-gray-600"
            width="72"
            class="mt-1"
          />
        </div>
        <p class="text-lg font-semibold tabular-nums">
          <span
            :class="{ 'text-orange-500': votingPeriodLastHour }"
            v-if="votingPeriodEnd.length"
          >
            {{
              $t('veBAL.liquidityMining.votingPeriodCountdown', votingPeriodEnd)
            }}
          </span>
        </p>
      </BalCard>
    </div>
  </div>
  <GaugesTable
    :expiredGauges="expiredGauges"
    :isLoading="isLoading"
    :data="votingGauges"
    :key="votingGauges && isLoading"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
    @clickedVote="setActiveGaugeVote"
  />
  <teleport to="#modal">
    <GaugeVoteModal
      v-if="!!activeVotingGauge"
      :gauge="activeVotingGauge"
      :logoURIs="orderedTokenURIs(activeVotingGauge)"
      :poolURL="
        poolURLFor(activeVotingGauge.pool.id, activeVotingGauge.network)
      "
      :unallocatedVoteWeight="unallocatedVoteWeight"
      :veBalLockInfo="veBalLockInfoQuery.data"
      @success="handleVoteSuccess"
      @close="handleModalClose"
    />
  </teleport>
</template>
