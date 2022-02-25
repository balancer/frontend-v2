<script setup lang="ts">
import { defineEmits, defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';

import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';

import { isStableLike } from '@/composables/usePool';
import useBreakpoints from '@/composables/useBreakpoints';

import { Pool } from './types';

/**
 * TYPES
 */
type Row = {
  chain: Pool['chain'];
  tokens: Pool['tokens'];
  composition: string;
};

type Props = {
  pools: Pool[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  loadMore?: () => void;
  isPaginated?: boolean;
  noResultsLabel?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isLoadingMore: false,
  isPaginated: false
});

const emit = defineEmits(['loadMore']);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const columns = computed<ColumnDefinition<Row>[]>(() => [
  {
    name: t('veBAL.liquidityMining.table.chain'),
    id: 'chain',
    accessor: '',
    Cell: 'chainCell',
    width: 150,
    sortable: false
  },
  {
    name: t('veBAL.liquidityMining.table.assets'),
    id: 'assets',
    accessor: '',
    Cell: 'assetsCell',
    width: 150,
    sortable: false
  },
  {
    name: t('veBAL.liquidityMining.table.composition'),
    id: 'composition',
    accessor: '',
    Cell: 'compositionCell',
    width: 325,
    sortable: false
  },
  {
    name: t('veBAL.liquidityMining.table.nextPeriodVotes'),
    id: 'nextPeriodVotes',
    accessor: '',
    Cell: 'nextPeriodVotesCell',
    align: 'right',
    width: 200,
    sortable: false
  },
  {
    name: t('veBAL.liquidityMining.table.myVotes'),
    id: 'myVote',
    accessor: '',
    Cell: 'myVoteCell',
    align: 'right',
    width: 200,
    sortable: false
  },
  {
    name: t('veBAL.liquidityMining.table.vote'),
    id: 'vote',
    accessor: '',
    Cell: 'voteCell',
    align: 'right',
    width: 200,
    sortable: false
  }
]);

const rows = computed<Row[]>(() =>
  props.isLoading
    ? []
    : props.pools.map(pool => ({
        chain: pool.chain,
        composition: '',
        tokens: pool.tokens
      }))
);
</script>

<template>
  <BalCard
    class="overflow-x-auto"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="rows"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      :is-paginated="isPaginated"
      @load-more="emit('loadMore')"
      skeleton-class="h-64"
      sticky="both"
    >
      <template v-slot:chainCell="pool">
        <div class="px-6 py-2">
          <div class="cell">
            {{ pool.chain }}
          </div>
        </div>
      </template>

      <template v-slot:assetsCell="pool">
        <div class="px-6 py-2">
          <div class="cell">
            <BalAsset
              v-for="token in pool.tokens"
              :address="token.address"
              :size="32"
              :key="token.address"
              class="mr-2"
            />
          </div>
        </div>
      </template>

      <template v-slot:compositionCell="pool">
        <div class="px-6 py-2">
          <div class="cell">
            <TokenPills
              :tokens="pool.tokens"
              :isStablePool="isStableLike(pool.poolType)"
            />
          </div>
        </div>
      </template>

      <template v-slot:nextPeriodVotesCell>
        <div class="px-6 py-2">
          <div class="cell cell-right-aligned">
            -
          </div>
        </div>
      </template>

      <template v-slot:myVoteCell>
        <div class="px-6 py-2">
          <div class="cell cell-right-aligned">
            -
          </div>
        </div>
      </template>

      <template v-slot:voteCell>
        <div class="px-6 py-2">
          <div class="cell cell-right-aligned">
            -
          </div>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<style scoped>
.cell {
  @apply flex items-center;
}
.cell-right-aligned {
  @apply justify-end whitespace-nowrap text-right;
}
</style>
