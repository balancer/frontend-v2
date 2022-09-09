
<script setup lang="ts">
import { computed } from 'vue';
import { isSameAddress, scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import BigNumber from 'bignumber.js';
import useNumbers from '@/composables/useNumbers';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import { useI18n } from 'vue-i18n';

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
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { gaugesUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();

const myVotes = computed(() => {
  const normalizedVotes = scale(new BigNumber(props.gauge.userVotes), -4);
  return fNum2(normalizedVotes.toString(), {
    style: 'percent',
    maximumFractionDigits: 2,
  });
});

const poolHasUnderUtilizedVotingPoewer = computed<boolean>(
  () =>
    !!gaugesUsingUnderUtilizedVotingPower.value.find(gauge =>
      isSameAddress(gauge.address, props.gauge.address)
    )
);
</script>

<template>
  <div
    :class="{
      'flex justify-end items-center': true,
      'text-red-600': poolHasUnderUtilizedVotingPoewer,
    }"
  >
    {{ myVotes }}
    <template v-if="poolHasUnderUtilizedVotingPoewer">
      <BalTooltip textAlign="left" width="60">
        <template #activator>
          <BalIcon class="ml-1" name="alert-triangle" size="sm" />
        </template>
        <div class="flex flex-col gap-1">
          <span class="font-semibold"
            >{{ t('veBAL.liquidityMining.resubmit.hint.title') }}
          </span>
          <span>
            {{ t('veBAL.liquidityMining.resubmit.hint.description') }}
          </span>
        </div>
      </BalTooltip>
    </template>
  </div>
</template>

