<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import ClaimBalBtn from '@/components/btns/ClaimBalBtn/ClaimBalBtn.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses,
} from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { GaugePool } from '@/composables/useClaimsData';

import { Gauge } from '@/services/balancer/gauges/types';

/**
 * TYPES
 */
export type RewardRow = {
  gauge: Gauge;
  pool: GaugePool;
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
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum2 } = useNumbers();
const router = useRouter();

/**
 * STATE
 */
const columns = ref<ColumnDefinition<RewardRow>[]>([
  {
    name: t('pools'),
    id: 'icons',
    accessor: 'icons',
    Cell: 'iconsColumnCell',
    width: 125,
    noGrow: true,
  },
  {
    name: '',
    id: 'pills',
    accessor: 'pills',
    Cell: 'pillsColumnCell',
    width: 350,
  },
  {
    name: t('amount'),
    id: 'amount',
    align: 'right',
    width: 150,
    totalsCell: 'totalAmountCell',
    accessor: ({ amount }) => `${fNum2(amount, FNumFormats.token)} BAL`,
  },
  {
    name: t('value'),
    id: 'value',
    align: 'right',
    width: 150,
    totalsCell: 'totalValueCell',
    accessor: ({ value }) => fNum2(value, FNumFormats.fiat),
  },
  {
    name: '',
    id: 'claim',
    accessor: 'claim',
    Cell: 'claimColumnCell',
    totalsCell: 'claimTotalCell',
    width: 150,
  },
]);

/**
 * COMPUTED
 */
const allGauges = computed((): Gauge[] =>
  props.rewardsData.map(row => row.gauge)
);

const totalClaimAmount = computed((): string =>
  props.rewardsData
    .reduce((acc, row) => acc.plus(row.amount), bnum('0'))
    .toString()
);

const totalClaimValue = computed((): string =>
  props.rewardsData
    .reduce((acc, row) => acc.plus(row.value), bnum('0'))
    .toString()
);

/**
 * METHODS
 */
function redirectToPool({ pool }: { pool: GaugePool }) {
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
      :onRowClick="redirectToPool"
      skeletonClass="h-64"
      :square="upToLargeBreakpoint"
    >
      <template #iconsColumnCell="{ pool }">
        <div class="py-4 px-6">
          <BalAssetSet :addresses="orderedTokenAddresses(pool)" :width="100" />
        </div>
      </template>
      <template #pillsColumnCell="{ pool }">
        <div class="py-4 px-6">
          <TokenPills
            :tokens="orderedPoolTokens(pool, pool.tokens)"
            :isStablePool="isStableLike(pool.poolType)"
          />
        </div>
      </template>
      <template #claimColumnCell="{ gauge, amount }">
        <div class="py-4 px-6">
          <ClaimBalBtn
            :label="$t('claim')"
            :gauges="[gauge]"
            :amount="amount"
          />
        </div>
      </template>
      <template #totalAmountCell>
        <div class="flex justify-end">
          {{ fNum2(totalClaimAmount, FNumFormats.token) }} BAL
        </div>
      </template>
      <template #totalValueCell>
        <div class="flex justify-end">
          {{ fNum2(totalClaimValue, FNumFormats.fiat) }}
        </div>
      </template>
      <template #claimTotalCell>
        <ClaimBalBtn
          :label="$t('claimAll')"
          :gauges="allGauges"
          :amount="totalClaimAmount"
        />
      </template>
    </BalTable>
  </BalCard>
</template>
