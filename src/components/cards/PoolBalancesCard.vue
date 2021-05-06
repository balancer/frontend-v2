<template>
  <BalCard class="overflow-x-auto whitespace-nowrap" no-pad>
    <BalTable
      :columns="columns"
      :data="tableData"
      :is-loading="loading"
      skeleton-class="h-64"
      sticky="both"
    >
      <template v-slot:tokenColumnCell="token">
        <div class="px-6 py-8 flex flex-row icon-stack">
          <BalLink :href="explorer.addressLink(token.address)" external>
            <BalAsset :address="token.address" :size="36" />
            <span class="pl-4">
              {{ symbolFor(token.address) }}
            </span>
          </BalLink>
        </div>
      </template>
      <template v-slot:tokenWeightCell="token">
        <div class="px-6 py-8">
          {{ weightFor(token.index) }}
        </div>
      </template>
      <template v-slot:tokenBalanceCell="token">
        <div class="px-6 py-8">
          {{ balanceFor(token.index) }}
        </div>
      </template>
      <template v-slot:tokenValueCell="token">
        <div class="px-6 py-8">
          {{ fiatValueFor(token.index) }}
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { formatUnits } from '@ethersproject/units';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import useTokens from '@/composables/useTokens';
import { Pool } from '@/utils/balancer/types';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    pool: {
      type: Object as PropType<Pool> | null,
      required: true
    },
    loading: { type: Boolean, default: false }
  },
  setup(props) {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { explorer } = useWeb3();
    const { allTokens } = useTokens();
    const { t } = useI18n();

    // DATA
    const { pool } = toRefs(props);

    // COMPUTED
    const prices = computed(() => store.state.market.prices);

    const tokenValues = computed(() => {
      if (!prices.value || !pool.value.tokenBalances) {
        return [];
      }

      const tokenValues = pool.value.tokenBalances.map((balance, index) => {
        const address = pool.value.tokens[index];
        const token = allTokens.value[address];
        const decimals = token ? token.decimals : 18;
        const shortBalanceString = formatUnits(balance, decimals);
        const shortBalance = parseFloat(shortBalanceString);
        const price = prices.value[address.toLowerCase()]?.price;
        return price ? shortBalance * price : 0;
      });

      return tokenValues;
    });

    const tableData = computed(() => {
      if (props.loading) return [];
      return pool.value.tokens.map((address, index) => ({ address, index }));
    });

    const columns = computed(() => [
      {
        name: t('token'),
        id: 'token',
        accessor: 'address',
        Cell: 'tokenColumnCell',
        className: 'w-full'
      },
      {
        name: t('weight'),
        id: 'weight',
        accessor: 'index',
        Cell: 'tokenWeightCell',
        align: 'right',
        className: 'pool-balance-table-cell'
      },
      {
        name: t('poolBalance'),
        id: 'poolBalance',
        accessor: 'index',
        Cell: 'tokenBalanceCell',
        align: 'right',
        className: 'pool-balance-table-cell'
      },
      {
        name: t('poolValue'),
        id: 'value',
        accessor: 'index',
        Cell: 'tokenValueCell',
        align: 'right',
        className: 'pool-balance-table-cell'
      }
    ]);

    function symbolFor(address: string) {
      const token = allTokens.value[address];
      return token ? token.symbol : address;
    }

    function balanceFor(index: number) {
      const address = pool.value.tokens[index];
      const denormBalance = pool.value.tokenBalances[index].toString();
      const token = allTokens.value[address];
      const decimals = token ? token.decimals : 18;
      const balance = formatUnits(denormBalance, decimals);
      return fNum(balance, 'token');
    }

    function weightFor(index: number) {
      return fNum(pool.value.weightsPercent[index] / 100, 'percent');
    }

    function fiatValueFor(index: number) {
      if (tokenValues.value[index] === 0) return '-';
      return fNum(tokenValues.value[index], 'usd');
    }

    return {
      symbolFor,
      balanceFor,
      weightFor,
      fiatValueFor,
      fNum,
      explorer,
      columns,
      tableData
    };
  }
});
</script>

<style>
.pool-balance-table-cell {
  min-width: 10rem;
}
</style>
