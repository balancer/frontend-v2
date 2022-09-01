
<script setup lang="ts">
import { computed } from 'vue';
import { isSameAddress, scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import BigNumber from 'bignumber.js';
import useNumbers from '@/composables/useNumbers';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';

/**
 * TYPES
 */
type Props = {
  gauge: VotingGaugeWithVotes;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { poolsUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();

const myVotes = computed(() => {
  const normalizedVotes = scale(new BigNumber(props.gauge.userVotes), -4);
  return fNum2(normalizedVotes.toString(), {
    style: 'percent',
    maximumFractionDigits: 2,
  });
});

const poolHasUnderUtilizedVotingPoewer = computed<boolean>(
  () =>
    !!poolsUsingUnderUtilizedVotingPower.value.find(address =>
      isSameAddress(address, props.gauge.address)
    )
);
</script>

<template>
  <div>
    {{ myVotes }}
    <span v-if="poolHasUnderUtilizedVotingPoewer">RESUBMIT VOTES</span>
  </div>
</template>

