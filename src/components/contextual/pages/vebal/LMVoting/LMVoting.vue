<script lang="ts" setup>
import { computed } from 'vue';
import { scale, bnum } from '@/lib/utils';
import {
  formatDuration,
  intervalToDuration,
  Interval,
  Duration
} from 'date-fns';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVotingGauges from '@/composables/useVotingGauges';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import GaugesTable from './GaugesTable.vue';

/**
 * CONSTANTS
 */

const EPOCH_GENESIS = 1596636000000;
const WEEK_IN_MS = 86_400_000 * 7;

/**
 * COMPOSABLES
 */
const {
  isLoading,
  votingGauges,
  unallocatedVotes,
  refetch
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
  const currentEpoch = Number(veBalLockInfoQuery.data.value.epoch);
  const periodEnd = EPOCH_GENESIS + currentEpoch * WEEK_IN_MS;
  const interval: Interval = { start: Date.now(), end: periodEnd };
  const timeUntilEnd: Duration = intervalToDuration(interval);
  const formattedTime = [
    timeUntilEnd.days || 0,
    timeUntilEnd.hours || 0,
    timeUntilEnd.minutes || 0,
    timeUntilEnd.seconds || 0
  ];
  return formattedTime;
});
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
    :refetch="refetch"
    :noPoolsLabel="$t('noInvestments')"
    showPoolShares
    class="mb-8"
  />
</template>
