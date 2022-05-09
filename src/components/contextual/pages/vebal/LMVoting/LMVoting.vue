<script lang="ts" setup>
import { Duration, Interval, intervalToDuration, nextThursday } from 'date-fns';
import { computed, ref } from 'vue';

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

const now = ref(Date.now());
setInterval(() => {
  now.value = Date.now();
}, 1000);

/**
 * COMPOSABLES
 */
const {
  isLoading,
  votingGauges,
  unallocatedVotes,
  refetch: refetchVotingGauges
} = useVotingGauges();
const { fNum2 } = useNumbers();
const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * COMPUTED
 */
const unallocatedVotesFormatted = computed<string>(() =>
  fNum2(scale(bnum(unallocatedVotes.value), -4).toString(), FNumFormats.percent)
);

const votingPeriodEnd = computed<number[]>(() => {
  const periodEnd = getVotePeriodEndTime();
  const interval: Interval = { start: now.value, end: periodEnd };
  const timeUntilEnd: Duration = intervalToDuration(interval);
  const formattedTime = [
    timeUntilEnd.days || 0,
    timeUntilEnd.hours || 0,
    timeUntilEnd.minutes || 0,
    timeUntilEnd.seconds || 0
  ];
  return formattedTime;
});

const votingPeriodLastHour = computed((): boolean => {
  const periodEnd = getVotePeriodEndTime();
  const interval: Interval = { start: now.value, end: periodEnd };
  const timeUntilEnd: Duration = intervalToDuration(interval);
  return (timeUntilEnd.days || 0) < 1 && (timeUntilEnd.hours || 0) < 1;
});

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
  return sortedTokens.map(token => gauge.tokenLogoURIs[token?.address || '']);
}

function handleModalClose() {
  activeVotingGauge.value = null;
  refetchVotingGauges.value();
}

function handleVoteSuccess() {
  refetchVotingGauges.value();
}

function getVotePeriodEndTime(): number {
  let n = nextThursday(new Date());
  // April 5th 2022, for launch, remove after this date
  if (n.getTime() < 1649116800000) {
    n = nextThursday(n);
  }
  const epochEndTime = Date.UTC(
    n.getFullYear(),
    n.getMonth(),
    n.getDate(),
    0,
    0,
    0
  );
  return epochEndTime;
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
          <span>{{ timeUntilEnd }}</span>
        </p>
      </BalCard>
    </div>
  </div>
  <GaugesTable
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
