<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BigNumber from 'bignumber.js';
import { scale } from '@/lib/utils';

import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';

import GaugeVote from './GaugeVote.vue';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';

/**
 * TYPES
 */
type Props = {
  data?: VotingGaugeWithVotes[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  refetch?: () => void;
};

/**
 * PROPS & EMITS
 */

const props = withDefaults(defineProps<Props>(), {
  isLoadingMore: false,
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false
});

const emit = defineEmits(['loadMore']);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * DATA
 */
const columns = ref<ColumnDefinition<VotingGaugeWithVotes>[]>([
  {
    name: t('veBAL.liquidityMining.table.chain'),
    id: 'chain',
    accessor: '',
    Header: 'chainColumnHeader',
    Cell: 'chainCell',
    width: 50,
    noGrow: true
  },
  {
    name: t('veBAL.liquidityMining.table.assets'),
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true
  },
  {
    name: t('veBAL.liquidityMining.table.composition'),
    id: 'poolComposition',
    accessor: 'id',
    Cell: 'poolCompositionCell',
    width: 350
  },
  {
    name: t('veBAL.liquidityMining.table.nextPeriodVotes'),
    accessor(gauge) {
      const normalizedVotes = scale(new BigNumber(gauge.votes), -18);
      return fNum2(normalizedVotes.toString(), {
        style: 'percent',
        maximumFractionDigits: 2
      });
    },
    align: 'right',
    id: 'poolGaugeVotes',
    sortKey: gauge => Number(gauge.votes),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('veBAL.liquidityMining.table.myVotes'),
    accessor(gauge) {
      const normalizedVotes = scale(new BigNumber(gauge.userVotes), -4);
      return fNum2(normalizedVotes.toString(), {
        style: 'percent',
        maximumFractionDigits: 2
      });
    },
    align: 'right',
    id: 'myVotes',
    sortKey: gauge => Number(gauge.userVotes),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('veBAL.liquidityMining.table.vote'),
    id: 'vote',
    accessor: 'id',
    align: 'right',
    Cell: 'voteColumnCell',
    width: 60
  }
]);

/**
 * COMPUTED
 */

const unallocatedVoteWeight = computed(() => {
  const totalVotes = 1e4;
  if (props.isLoading || !props.data) return totalVotes;
  const votesRemaining = props.data.reduce((remainingVotes, gauge) => {
    return remainingVotes - parseFloat(gauge.userVotes);
  }, totalVotes);
  return votesRemaining;
});

/**
 * METHODS
 */
function orderedPoolTokens(gauge: VotingGaugeWithVotes) {
  const sortedTokens = gauge.tokens.slice();
  sortedTokens.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  return sortedTokens;
}

async function handleVoteSuccess() {
  if (props.refetch) {
    await props.refetch();
  }
}
</script>

<template>
  <BalCard
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :key="data"
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :is-paginated="isPaginated"
      @load-more="emit('loadMore')"
      :initial-state="{
        sortColumn: 'poolValue',
        sortDirection: 'desc'
      }"
    >
      <template v-slot:chainColumnHeader>
        <div class="flex items-center">
          <NetworkIcon />
        </div>
      </template>
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <CompositionIcon />
        </div>
      </template>
      <template v-slot:networkColumnCell="{ chain }">
        <div v-if="!isLoading" class="px-6 py-4">
          <img
            :src="require(`@/assets/images/icons/networks/${chain}.svg`)"
            :alt="chain"
            class="w-5 h-5 rounded-full shadow-sm"
          />
        </div>
      </template>
      <template v-slot:iconColumnCell>
        <div v-if="!isLoading" class="px-6 py-4">
          <!-- <BalAssetSet
            :addresses="orderedTokenAddressesFor(gauge)"
            :width="100"
          /> -->
        </div>
      </template>
      <template v-slot:poolCompositionCell="gauge">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills :tokens="orderedPoolTokens(gauge)" />
        </div>
      </template>
      <template v-slot:voteColumnCell="gauge">
        <div class="px-4">
          <GaugeVote
            :gauge="gauge"
            :unallocatedVoteWeight="unallocatedVoteWeight"
            @success="handleVoteSuccess"
          ></GaugeVote>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
