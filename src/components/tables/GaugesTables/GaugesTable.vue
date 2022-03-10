<script setup lang="ts">
import { ref, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { PoolToken, PoolWithGauge } from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';
import BigNumber from 'bignumber.js';
import { scale } from '@/lib/utils';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import GaugeVote from '@/components/vebal/GaugeVote.vue';
import TokenPills from '../PoolsTable/TokenPills/TokenPills.vue';

/**
 * TYPES
 */
type Props = {
  data?: ComputedRef<PoolWithGauge[]>;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
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
const router = useRouter();
const { t } = useI18n();
const { darkMode } = useDarkMode();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * DATA
 */
const columns = ref<ColumnDefinition<PoolWithGauge>[]>([
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
    accessor(pool) {
      const normalizedVotes = scale(new BigNumber(pool.gauge.votes), -18);
      return fNum2(normalizedVotes.toString(), {
        style: 'percent',
        maximumFractionDigits: 2
      });
    },
    align: 'right',
    id: 'poolGaugeVotes',
    sortKey: pool => Number(pool.gauge.votes),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('veBAL.liquidityMining.table.myVotes'),
    accessor(pool) {
      const normalizedVotes = scale(new BigNumber(pool.gauge.userVotes), -4);
      return fNum2(normalizedVotes.toString(), {
        style: 'percent',
        maximumFractionDigits: 2
      });
    },
    align: 'right',
    id: 'myVotes',
    sortKey: pool => Number(pool.gauge.userVotes),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('veBAL.liquidityMining.table.vote'),
    id: 'vote',
    accessor: 'id',
    align: 'right',
    Cell: 'voteColumnCell',
    width: 50,
    noGrow: true
  }
]);

/**
 * METHODS
 */
function orderedTokenAddressesFor(pool: PoolWithGauge) {
  const sortedTokens = orderedPoolTokens(pool);
  return sortedTokens.map(token => getAddress(token.address));
}

function orderedPoolTokens(pool: PoolWithGauge): PoolToken[] {
  const sortedTokens = pool.tokens.slice();
  sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  return sortedTokens;
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
          <img
            v-if="darkMode"
            :src="require('@/assets/images/icons/tokens_white.svg')"
          />
          <img
            v-else
            :src="require('@/assets/images/icons/tokens_black.svg')"
          />
        </div>
      </template>
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="require('@/assets/images/icons/tokens_white.svg')"
          />
          <img
            v-else
            :src="require('@/assets/images/icons/tokens_black.svg')"
          />
        </div>
      </template>
      <template v-slot:networkColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <img
            :src="
              require(`@/assets/images/icons/networks/${pool.network.id}.svg`)
            "
            :alt="pool.network.name"
            class="w-5 h-5 rounded-full shadow-sm"
          />
        </div>
      </template>
      <template v-slot:iconColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet
            :addresses="orderedTokenAddressesFor(pool)"
            :width="100"
          />
        </div>
      </template>
      <template v-slot:poolCompositionCell="pool">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills :tokens="orderedPoolTokens(pool)" />
        </div>
      </template>
      <template v-slot:voteColumnCell="pool">
        <GaugeVote :pool="pool"></GaugeVote>
      </template>
    </BalTable>
  </BalCard>
</template>
