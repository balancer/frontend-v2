<script lang="ts" setup>
import { computed, ref } from 'vue';
import { scale, bnum } from '@/lib/utils';
import { intervalToDuration, Interval, Duration, add } from 'date-fns';

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
  if (!veBalLockInfoQuery.data.value) return [];
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

function getVotePeriodEndTime(): number {
  var d = new Date();
  const dayOfWeek = d.getDay();
  let daysUntilThursday = 4 - dayOfWeek;
  if (daysUntilThursday <= 0) {
    daysUntilThursday += 7;
  }
  const nextThursdayTimestamp = add(d, { days: daysUntilThursday });
  const n = new Date(nextThursdayTimestamp);
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
  <h3 class="mb-3">{{ $t('veBAL.liquidityMining.title') }}</h3>
  <div class="mb-3">
    {{
      $t('veBAL.liquidityMining.unallocatedVotes', [unallocatedVotesFormatted])
    }}
    <span v-if="votingPeriodEnd.length">
      {{ $t('veBAL.liquidityMining.votingPeriod', votingPeriodEnd) }}
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
      @close="handleModalClose"
    />
  </teleport>
</template>
