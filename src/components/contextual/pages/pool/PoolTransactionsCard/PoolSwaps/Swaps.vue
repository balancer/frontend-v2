<script setup lang="ts">
import { flatten } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { shortenLabel } from '@/lib/utils';

import usePoolSwapsQuery from '@/composables/queries/usePoolSwapsQuery';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';

import Table from './Table.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  loading: boolean;
};

/**
 * PROPS
 */
withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * COMPOSABLES
 */
const route = useRoute();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { priceFor } = useTokens();

/**
 * STATE
 */
const id = route.params.id as string;
const stats = computed(() => {
  if (!poolSwaps.value || !poolSwaps.value.length) {
    return [];
  }
  const poolSwapsLength = poolSwaps.value.length;

  const largestValue = poolSwaps.value.reduce((prev, current) =>
    Number(prev.tokenAmountOut) > Number(current.tokenAmountOut)
      ? prev
      : current
  );

  const avgValue =
    poolSwaps.value.reduce(
      (total, current) => total + Number(current.tokenAmountOut),
      0
    ) / poolSwapsLength;

  return [
    {
      label: t('Largest trade'),
      value: fNum2(
        bnum(priceFor(largestValue.tokenOut))
          .times(largestValue.tokenAmountOut)
          .toNumber(),
        { style: 'currency', abbreviate: true }
      )
    },
    {
      label: t('Average trade'),
      value: fNum2(
        bnum(priceFor(largestValue.tokenOut))
          .times(avgValue)
          .toNumber(),
        { style: 'currency', abbreviate: true }
      )
    },
    {
      label: t('Number of trades'),
      value: fNum2(poolSwapsLength, { abbreviate: true })
    }
  ];
});
/**
 * QUERIES
 */
const poolSwapsQuery = usePoolSwapsQuery(id);

/**
 * COMPUTED
 */
const poolSwaps = computed(() =>
  poolSwapsQuery.data.value
    ? flatten(poolSwapsQuery.data.value.pages.map(page => page.poolSwaps))
    : []
);
const isLoadingPoolSwaps = computed(() => poolSwapsQuery.isLoading.value);
const poolSwapsHasNextPage = computed(() => poolSwapsQuery.hasNextPage?.value);
const poolSwapsIsFetchingNextPage = computed(
  () => poolSwapsQuery.isFetchingNextPage?.value
);

/**
 * METHODS
 */
function loadMorePoolSwaps() {
  poolSwapsQuery.fetchNextPage.value();
}
</script>

<template>
  <div class="flex">
    <BalCard v-for="(stat, i) in stats" :key="i" class="ml-5">
      <div class="text-sm text-gray-500 font-medium mb-2 flex">
        <span>{{ stat.label }}</span>
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ stat.value }}
      </div>
    </BalCard>
  </div>
  <Table
    :tokens="pool ? pool.tokensList : []"
    :pool-swaps="poolSwaps"
    :is-loading="loading || isLoadingPoolSwaps"
    :is-loading-more="poolSwapsIsFetchingNextPage"
    :is-paginated="poolSwapsHasNextPage"
    @load-more="loadMorePoolSwaps"
    :no-results-label="$t('poolTransactions.noResults.swaps')"
  />
</template>
