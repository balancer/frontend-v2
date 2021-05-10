<template>
  <BalCard class="overflow-x-auto" no-pad>
    <BalTable
      :columns="columns"
      :data="activityRows"
      :is-loading="loading"
      skeleton-class="h-64"
      sticky="both"
    >
      <template v-slot:actionCell="action">
        <div class="pool-activity-cell">
          <PlusSquareIcon v-if="action.type === 'join'" />
          <MinusSquareIcon v-else />
          {{ action.label }}
        </div>
      </template>

      <template v-slot:valueCell="action">
        <div class="pool-activity-cell">
          {{ fNum(action.value, 'usd_m') }}
        </div>
      </template>

      <template v-slot:detailsCell="action">
        <div class="pool-activity-cell flex-wrap">
          <template v-for="(tokenAmount, i) in action.tokenAmounts" :key="i">
            <div
              class="m-1 flex items-center p-1 px-2 bg-gray-50 rounded-lg"
              v-if="tokenAmount.amount !== '0'"
            >
              <BalAsset
                :address="tokenAmount.address"
                class="mr-2 flex-shrink-0"
              />
              {{ tokenAmount.amount }}
            </div>
          </template>
        </div>
      </template>

      <template v-slot:dateCell="action">
        <div class="pool-activity-cell">
          {{ action.formattedDate }}
          <BalLink :href="explorer.txLink(action.tx)" external>
            <BalIcon
              name="external-link"
              size="sm"
              class="ml-2 text-gray-500 hover:text-blue-500"
            />
          </BalLink>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import numeral from 'numeral';

import useWeb3 from '@/composables/useWeb3';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';

import { getAddress } from '@ethersproject/address';

import {
  PoolActivity,
  PoolActivityType
} from '@/services/balancer/subgraph/types';
import { ColumnDefinition } from '../_global/BalTable/BalTable.vue';

import { formatDistanceToNow } from 'date-fns';
import { Token } from '@/types';
import { bnum } from '@balancer-labs/sor2/dist/bmath';

type TokenAmount = {
  address: string;
  symbol: string;
  amount: string;
};

interface ActivityRow {
  label: string;
  value: string;
  timestamp: number;
  formattedDate: string;
  tx: string;
  type: PoolActivityType;
  tokenAmounts: TokenAmount[];
}

export default {
  props: {
    tokens: {
      type: Object as PropType<string[]>,
      required: true
    },
    poolActivities: {
      type: Array as PropType<PoolActivity[]>,
      required: true
    },
    loading: { type: Boolean, default: false }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { t } = useI18n();
    const { explorer } = useWeb3();
    const { allTokens } = useTokens();

    const columns = computed<ColumnDefinition<ActivityRow>[]>(() => [
      {
        name: t('action'),
        id: 'action',
        accessor: 'tx',
        Cell: 'actionCell',
        className: 'w-12',
        sortable: false
      },
      {
        name: t('value'),
        id: 'value',
        accessor: 'value',
        Cell: 'valueCell',
        align: 'right',
        className: 'align-center w-12',
        sortKey: pool => numeral(pool.value).value()
      },
      {
        name: t('details'),
        id: 'details',
        accessor: '',
        Cell: 'detailsCell',
        className: 'w-40',
        sortable: false
      },
      {
        name: t('time'),
        id: 'dateAgo',
        accessor: 'timestamp',
        Cell: 'dateCell',
        align: 'right',
        className: 'w-12',
        sortKey: pool => numeral(pool.timestamp).value()
      }
    ]);

    const activityRows = computed<ActivityRow[]>(() =>
      props.poolActivities.map(({ type, timestamp, tx, amounts }) => {
        const isJoin = type === 'join';

        return {
          label: isJoin ? t('invest') : t('withdraw'),
          value: fNum(getJoinExitValue(amounts), 'usd'),
          timestamp,
          formattedDate: t('timeAgo', [formatDistanceToNow(timestamp)]),
          tx,
          type,
          tokenAmounts: getJoinExitDetails(amounts)
        };
      })
    );

    function getJoinExitValue(amounts: PoolActivity['amounts']) {
      return amounts
        .reduce((total, amount, index) => {
          const address = getAddress(props.tokens[index]);
          const token: Token = allTokens.value[address];
          const price = token.price || 0;
          const amountNumber = bnum(Math.abs(parseFloat(amount)));

          return total.plus(amountNumber.times(price));
        }, bnum(0))
        .toString();
    }

    function getJoinExitDetails(amounts: PoolActivity['amounts']) {
      return amounts.map((amount, index) => {
        const address = getAddress(props.tokens[index]);
        const token: Token = allTokens.value[address];
        const symbol = token ? token.symbol : address;
        const amountNumber = parseFloat(amount);

        return {
          address,
          symbol,
          amount: fNum(amountNumber, 'token')
        };
      });
    }

    return {
      columns,
      activityRows,
      explorer,
      fNum
    };
  }
};
</script>
<style>
.pool-activity-cell {
  @apply px-6 py-4 flex items-center flex-row;
}
</style>
