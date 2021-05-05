<template>
  <BalCard class="overflow-x-auto" no-pad>
    <BalTable
      :columns="columns"
      :data="actions"
      :is-loading="loading"
      skeleton-class="h-64"
      sticky="both"
    >
      <template v-slot:tokenActionCell="action">
        <div class="px-6 py-8 flex items-center flex-row">
          {{ action.label }}
          <BalLink :href="explorer.txLink(action.tx)" external>
            <BalIcon name="external-link" size="sm" class="ml-2" />
          </BalLink>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useWeb3 from '@/composables/useWeb3';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';

import { PoolActivity } from '@/services/balancer/subgraph/types';
import { ColumnDefinition } from '../_global/BalTable/BalTable.vue';

interface Action {
  label: string;
  value: number;
  details: string;
  timestamp: number;
  tx: string;
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

    const columns = computed<ColumnDefinition<Action>[]>(() => [
      {
        name: t('action'),
        id: 'action',
        accessor: 'tx',
        Cell: 'tokenActionCell',
        className: 'pool-balance-table-cell'
      },
      {
        name: t('details'),
        id: 'details',
        accessor: 'details',
        align: 'right',
        className: 'w-full'
      },
      {
        name: t('value'),
        id: 'value',
        accessor: action => fNum(action.value, 'usd'),
        align: 'right',
        className: 'pool-balance-table-cell'
      },
      {
        name: t('date'),
        id: 'date',
        accessor: action => formatDate(action.timestamp),
        align: 'right',
        className: 'pool-balance-table-cell'
      }
    ]);

    const actions = computed<Action[]>(() => {
      return props.poolActivities.map(poolActivity => ({
        label: poolActivity.type === 'join' ? t('investment') : t('withdrawal'),
        value: getJoinExitValue(poolActivity),
        details: getJoinExitDetails(poolActivity),
        timestamp: poolActivity.timestamp,
        tx: poolActivity.tx
      }));
    });

    function formatDate(timestamp: number) {
      const date = new Date(timestamp);
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long'
      };
      return date.toLocaleString('en-US', dateOptions);
    }

    function getJoinExitValue(poolActivity: PoolActivity) {
      const value = poolActivity.amounts.reduce((total, amount, index) => {
        const address = props.tokens[index];
        const token = allTokens.value[address];
        const price = token.price || 0;
        const amountNumber = Math.abs(parseFloat(amount));
        return total + amountNumber * price;
      }, 0);
      return value;
    }

    function getJoinExitDetails(poolActivity: PoolActivity) {
      const tokenLabels = poolActivity.amounts
        .map((amount, index) => {
          const address = props.tokens[index];
          const token = allTokens.value[address];
          const symbol = token ? token.symbol : address;
          const amountNumber = parseFloat(amount);
          return `${amountNumber.toFixed(2)} ${symbol}`;
        })
        .join(' ');
      return tokenLabels;
    }

    return {
      columns,
      actions,
      explorer
    };
  }
};
</script>
