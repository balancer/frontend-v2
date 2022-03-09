<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import {
  orderedTokenAddresses,
  orderedPoolTokens,
  isStableLike
} from '@/composables/usePool';
import { Pool } from '@/services/balancer/subgraph/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useRouter } from 'vue-router';

import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import ClaimBalBtn from '@/components/btns/ClaimBalBtn/ClaimBalBtn.vue';
import { Gauge } from '@/services/balancer/gauges/types';
import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
export type RewardRow = {
  gauge: Gauge;
  pool: Pool;
  amount: string;
  value: string;
};

type Props = {
  rewardsData: RewardRow[];
  isLoading: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum2 } = useNumbers();
const router = useRouter();

/**
 * STATE
 */
const columns = ref<ColumnDefinition<RewardRow>[]>([
  {
    name: 'Pools',
    id: 'icons',
    accessor: 'icons',
    Cell: 'iconsColumnCell',
    width: 125,
    noGrow: true
  },
  {
    name: '',
    id: 'pills',
    accessor: 'pills',
    Cell: 'pillsColumnCell',
    width: 350
  },
  {
    name: 'Amount',
    id: 'amount',
    align: 'right',
    width: 150,
    accessor: ({ amount }) => `${fNum2(amount, FNumFormats.token)} BAL`
  },
  {
    name: 'Value',
    id: 'value',
    align: 'right',
    width: 150,
    totalsCell: 'totalValueCell',
    accessor: ({ value }) => fNum2(value, FNumFormats.fiat)
  },
  {
    name: '',
    id: 'claim',
    accessor: 'claim',
    Cell: 'claimColumnCell',
    totalsCell: 'claimTotalCell',
    width: 150
  }
]);

/**
 * COMPUTED
 */
const allGauges = computed((): Gauge[] =>
  props.rewardsData.map(row => row.gauge)
);

const totalClaimValue = computed((): string =>
  props.rewardsData
    .reduce((acc, row) => acc.plus(row.value), bnum('0'))
    .toString()
);

/**
 * METHODS
 */
function redirectToPool({ pool }: { pool: Pool }) {
  router.push({ name: 'pool', params: { id: pool.id } });
}
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="rewardsData"
      :isLoading="isLoading"
      :on-row-click="redirectToPool"
      skeleton-class="h-64"
      :square="upToLargeBreakpoint"
    >
      <template #iconsColumnCell="{ pool }">
        <div class="px-6 py-4">
          <BalAssetSet :addresses="orderedTokenAddresses(pool)" :width="100" />
        </div>
      </template>
      <template #pillsColumnCell="{ pool }">
        <div class="px-6 py-4">
          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="isStableLike(pool.poolType)"
          />
        </div>
      </template>
      <template #claimColumnCell="{ gauge }">
        <div class="px-6 py-4">
          <ClaimBalBtn label="Claim" :gauges="[gauge]" />
        </div>
      </template>
      <template #totalValueCell>
        <div class="flex justify-end">
          {{ fNum2(totalClaimValue, FNumFormats.fiat) }}
        </div>
      </template>
      <template #claimTotalCell>
        <ClaimBalBtn label="Claim all" :gauges="allGauges" />
      </template>
    </BalTable>
  </BalCard>
</template>
