<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import ClaimBalBtn from '@/components/btns/ClaimBalBtn/ClaimBalBtn.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses
} from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
export type ProtocolRewardRow = {
  token: TokenInfo;
  amount: string;
  value: string;
};

type Props = {
  rewardsData: ProtocolRewardRow[];
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

/**
 * STATE
 */
const columns = ref<ColumnDefinition<ProtocolRewardRow>[]>([
  {
    name: t('token'),
    id: 'token',
    accessor: 'token',
    Cell: 'tokenColumnCell',
    width: 125,
    noGrow: true
  },
  {
    name: 'symbol',
    id: 'symbol',
    accessor: 'symbol',
    Cell: 'symbolColumnCell',
    width: 350
  },
  {
    name: t('amount'),
    id: 'amount',
    align: 'right',
    width: 150,
    totalsCell: 'totalAmountCell',
    accessor: ({ amount }) => `${fNum2(amount, FNumFormats.token)} BAL`
  },
  {
    name: t('value'),
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
            :tokens="
              orderedPoolTokens(pool.poolType, pool.address, pool.tokens)
            "
            :isStablePool="isStableLike(pool.poolType)"
          />
        </div>
      </template>
      <template #claimColumnCell="{ gauge, amount }">
        <div class="px-6 py-4">
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
        a btn
      </template>
    </BalTable>
  </BalCard>
</template>
