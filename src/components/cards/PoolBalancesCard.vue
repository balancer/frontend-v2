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
          <BalLink
            :href="explorer.addressLink(token.address)"
            external
            noStyle
            class="flex items-center"
          >
            <BalAsset :address="token.address" :size="36" />
            <span class="pl-4 font-medium">
              {{ symbolFor(token.address) }}
            </span>
            <BalIcon
              name="external-link"
              size="sm"
              class="ml-3 text-gray-500 hover:text-blue-500"
            />
          </BalLink>
        </div>
      </template>
      <template v-slot:tokenWeightCell="token">
        <div class="px-6 py-8">
          {{ weightFor(token.address) }}
        </div>
      </template>
      <template v-slot:tokenBalanceCell="token">
        <div class="px-6 py-8">
          {{ balanceFor(token.address) }}
        </div>
      </template>
      <template v-slot:tokenValueCell="token">
        <div class="px-6 py-8">
          {{ fiatValueFor(token.address) }}
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed, Ref } from 'vue';
import { useStore } from 'vuex';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import { useI18n } from 'vue-i18n';
import { FullPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  props: {
    pool: {
      type: Object as PropType<FullPool>,
      required: true
    },
    loading: { type: Boolean, default: false }
  },
  setup(props) {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { explorer, shortenLabel } = useWeb3();
    const { t } = useI18n();

    // DATA
    const { pool }: { pool: Ref<FullPool> } = toRefs(props);

    // COMPUTED
    const prices = computed(() => store.state.market.prices);

    const tableData = computed(() => {
      if (!pool || !pool.value || props.loading) return [];
      return Object.keys(pool.value.onchain.tokens).map((address, index) => ({
        address,
        index
      }));
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
      if (!pool || !pool.value) return '-';
      const symbol = pool.value.onchain.tokens[address].symbol;
      return symbol ? symbol : shortenLabel(address);
    }

    function balanceFor(address: string): string {
      if (!pool || !pool.value) return '-';
      return fNum(pool.value.onchain.tokens[address].balance, 'token');
    }

    function weightFor(address: string): string {
      if (!pool || !pool.value) return '-';
      return fNum(pool.value.onchain.tokens[address].weight, 'percent');
    }

    function fiatValueFor(address: string): string {
      const price = prices.value[address.toLowerCase()]?.price;
      if (!pool || !pool.value || !price) return '-';

      const balance = Number(pool.value.onchain.tokens[address].balance);
      return fNum(balance * price, 'usd');
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
