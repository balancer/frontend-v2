
<script setup lang="ts">
import { isSameAddress, scale } from '@/lib/utils';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import BigNumber from 'bignumber.js';
import useNumbers from '@/composables/useNumbers';
import useVotingEscrowLocks from '@/composables/useVotingEscrowLocks';
import { useI18n } from 'vue-i18n';
import { isVotingTimeLocked } from '@/composables/useVeBAL';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';
import TimeLockedVote from '../MultiVoting/TimeLockedVote.vue';

/**
 * TYPES
 */
type Props = {
  pool: VotingPool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum } = useNumbers();
const { poolsUsingUnderUtilizedVotingPower } = useVotingEscrowLocks();

const myVotes = computed(() => {
  const normalizedVotes = scale(new BigNumber(props.pool.userVotes), -4);
  return fNum(normalizedVotes.toString(), {
    style: 'percent',
    maximumFractionDigits: 2,
  });
});

const poolHasUnderUtilizedVotingPower = computed<boolean>(
  () =>
    !!poolsUsingUnderUtilizedVotingPower.value.find(pool =>
      isSameAddress(pool.address, props.pool.address)
    )
);
</script>

<template>
  <div
    :class="{
      'flex justify-end items-center': true,
      'text-red-600': poolHasUnderUtilizedVotingPower,
    }"
  >
    {{ myVotes }}
    <TimeLockedVote
      v-if="isVotingTimeLocked(pool.lastUserVoteTime)"
      :pool="pool"
    />
    <BalTooltip
      v-else-if="poolHasUnderUtilizedVotingPower"
      template
      textAlign="left"
      width="60"
    >
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
  </div>
</template>

