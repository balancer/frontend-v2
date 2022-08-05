<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import ClaimProtocolRewardsBtn from '@/components/btns/ClaimProtocolRewardsBtn.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
export type ProtocolRewardRow = {
  token: TokenInfo;
  amount: string;
  value: string;
  deprecated?: boolean;
};

type Props = {
  rewardsData: ProtocolRewardRow[];
  isLoading: boolean;
  deprecated?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  deprecated: false,
});

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
    align: 'left',
    width: 125,
    noGrow: true,
  },
  {
    name: '',
    id: 'symbol',
    accessor: 'symbol',
    Cell: 'symbolColumnCell',
    width: 350,
  },
  {
    name: t('amount'),
    id: 'amount',
    align: 'right',
    width: 150,
    accessor: ({ amount }) => `${fNum2(amount, FNumFormats.token)}`,
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

const hasClaimableBalance = computed((): boolean => {
  if (props.isLoading) return true;
  return bnum(totalClaimAmount.value).gt(0);
});
</script>

<template>
  <div>
    <div v-if="deprecated && hasClaimableBalance" class="mb-2">
      <h6>{{ $t('pastEarnings.title') }}</h6>
      <p>{{ $t('pastEarnings.description') }}</p>
    </div>
    <BalCard
      v-if="hasClaimableBalance || !deprecated"
      shadow="lg"
      :square="upToLargeBreakpoint"
      :noBorder="upToLargeBreakpoint"
      noPad
      class="mb-8"
    >
      <BalTable
        :columns="columns"
        :data="rewardsData"
        :isLoading="isLoading"
        skeletonClass="h-64"
        :square="upToLargeBreakpoint"
      >
        <template #tokenColumnCell="{ token }">
          <div class="flex py-4 px-6">
            <BalAsset :address="token.address" />
          </div>
        </template>
        <template #symbolColumnCell="{ token }">
          <div class="flex py-4 px-6">
            {{ token.symbol }}
          </div>
        </template>

        <template #totalValueCell>
          <div class="flex justify-end">
            {{ fNum2(totalClaimValue, FNumFormats.fiat) }}
          </div>
        </template>
        <template #claimColumnCell="{ token, amount, value }">
          <div class="py-4 px-6">
            <ClaimProtocolRewardsBtn
              :tokenAddress="token.address"
              :fiatValue="value"
              :disabled="bnum(amount).eq(0)"
              :deprecated="deprecated"
            />
          </div>
        </template>
        <template #claimTotalCell>
          <ClaimProtocolRewardsBtn
            :fiatValue="totalClaimValue"
            :disabled="!hasClaimableBalance"
            :deprecated="deprecated"
          />
        </template>
      </BalTable>
    </BalCard>
  </div>
</template>
