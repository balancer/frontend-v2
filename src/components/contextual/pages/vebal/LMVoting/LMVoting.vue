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
  refetch: refetchVotingGauges,
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
    class="flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-end mb-2"
  >
    <div class="px-4 xl:px-0 max-w-3xl">
      <h3 class="mb-2">
        {{ $t('veBAL.liquidityMining.title') }}
      </h3>
      <p class="">
        {{ $t('veBAL.liquidityMining.description') }}
      </p>
    </div>
    <div class="flex gap-2 xs:gap-3 px-4 xl:px-0">
      <BalCard shadow="none" class="md:w-48 min-w-max">
        <div class="flex items-center">
          <p class="inline mr-1 text-sm text-secondary">My unallocated votes</p>
          <BalTooltip
            :text="$t('veBAL.liquidityMining.myUnallocatedVotesTooltip')"
            icon-class="text-gray-400 dark:text-gray-600"
            icon-size="sm"
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
          icon-size="sm"
          :icon-name="'alert-triangle'"
          :icon-class="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
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
            icon-size="sm"
            icon-class="text-gray-400 dark:text-gray-600"
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
              $t('veBAL.liquidityMining.votingPeriodCountdown', votingPeriodEnd)
            }}
          </span>
        </p>
      </BalCard>
    </div>
  </div>
  <GaugesTable
    :key="votingGauges && isLoading"
    :expired-gauges="expiredGauges"
    :is-loading="isLoading"
    :data="votingGauges"
    :no-pools-label="$t('noInvestments')"
    show-pool-shares
    class="mb-8"
    @clicked-vote="setActiveGaugeVote"
  />
  <teleport to="#modal">
    <GaugeVoteModal
      v-if="!!activeVotingGauge"
      :gauge="activeVotingGauge"
      :logo-u-r-is="orderedTokenURIs(activeVotingGauge)"
      :pool-u-r-l="
        poolURLFor(activeVotingGauge.pool.id, activeVotingGauge.network)
      "
      :unallocated-vote-weight="unallocatedVoteWeight"
      :ve-bal-lock-info="veBalLockInfoQuery.data"
      @success="handleVoteSuccess"
      @close="handleModalClose"
    />
  </teleport>
</template>
