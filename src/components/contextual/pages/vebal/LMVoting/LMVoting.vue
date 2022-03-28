<script lang="ts" setup>
import { computed, ref } from 'vue';
import { scale, bnum } from '@/lib/utils';
import { intervalToDuration, Interval, Duration, nextThursday } from 'date-fns';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVotingGauges from '@/composables/useVotingGauges';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

import GaugesTable from './GaugesTable.vue';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { orderedPoolTokens, poolURLFor } from '@/composables/usePool';
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
    class="bg-yellow-500 flex items-center rounded-lg p-4 mb-8 text-gray-900"
  >
    <LightBulbIcon width="36" height="36" class="w-36 lg:w-16" />
    <p class="ml-4 max-w-4xl">
      {{ $t('veBAL.votingTransitionDescription') }}
    </p>
  </div>
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">
    <span v-if="hasLock">
      {{
        $t('veBAL.liquidityMining.unallocatedVotes', [
          unallocatedVotesFormatted
        ])
      }}
    </span>
    <span v-else>
      <BalLink
        tag="router-link"
        :to="{ name: 'get-vebal', query: { returnRoute: 'vebal' } }"
        class="inline-block"
      >
        {{ $t('getVeBALToVote') }}</BalLink
      >.
    </span>
    <span v-if="votingPeriodEnd.length">
      &nbsp;{{ $t('veBAL.liquidityMining.votingPeriod', votingPeriodEnd) }}
    </span>
  </div>
  <GaugesTable
    :isLoading="isLoading"
    :data="votingGauges"
    :key="votingGauges"
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
