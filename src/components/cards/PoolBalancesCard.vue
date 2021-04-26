<template>
  <BalCard class="overflow-x-auto whitespace-nowrap" no-pad>
    <BalTable
      :columns="columns"
      :data="tokens.map((address, index) => ({ address, index }))"
      :is-loading="loading"
      skeleton-class="h-64"
      sticky="both"
    >
      <template v-slot:tokenColumnCell="token">
        <div class="px-6 py-8 flex flex-row icon-stack">
          <BalLink :href="explorer.addressLink(token.address)" external>
            <Avatar :address="token.address" :size="24" />
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
import { BigNumber } from '@ethersproject/bignumber';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  props: {
    tokens: {
      type: Array as PropType<string[]>,
      required: true
    },
    balances: {
      type: Array as PropType<BigNumber[]>,
      required: true
    },
    weights: {
      type: Array as PropType<number[]>,
      required: true
    },
    missingPrices: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  setup(props) {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { explorer } = useWeb3();
    const { allTokens } = useTokens();

    // DATA
    const { tokens, balances, weights } = toRefs(props);

    // COMPUTED
    const prices = computed(() => store.state.market.prices);

    const tokenValues = computed(() => {
      if (!prices.value || !balances.value) {
        return [];
      }

      const tokenValues = balances.value.map((balance, index) => {
        const address = tokens.value[index];
        const token = allTokens.value[address];
        const decimals = token ? token.decimals : 18;
        const shortBalanceString = formatUnits(balance, decimals);
        const shortBalance = parseFloat(shortBalanceString);
        const price = prices.value[address.toLowerCase()].price;
        const value = shortBalance * price;
        return value;
      });

      return tokenValues;
    });

    const columns = computed(() => [
      {
        name: 'Token',
        id: 'token',
        accessor: 'address',
        Cell: 'tokenColumnCell',
        className: 'w-full'
      },
      {
        name: 'Weight',
        id: 'weight',
        accessor: 'index',
        Cell: 'tokenWeightCell',
        align: 'right',
        className: 'pool-balance-table-cell'
      },
      {
        name: 'Pool balance',
        id: 'poolBalance',
        accessor: 'index',
        Cell: 'tokenBalanceCell',
        align: 'right',
        className: 'pool-balance-table-cell'
      },
      {
        name: 'Pool value',
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
      const address = tokens.value[index];
      const denormBalance = balances.value[index].toString();
      const token = allTokens.value[address];
      const decimals = token ? token.decimals : 18;
      const balance = formatUnits(denormBalance, decimals);
      return fNum(balance, 'token');
    }

    function weightFor(index: number) {
      return fNum(weights.value[index] / 100, 'percent');
    }

    function fiatValueFor(index: number) {
      if (props.missingPrices) return '-';
      return fNum(tokenValues.value[index] || 0, 'usd');
    }

    return {
      symbolFor,
      balanceFor,
      weightFor,
      fiatValueFor,
      fNum,
      explorer,
      columns
    };
  }
});
</script>

<style>
.pool-balance-table-cell {
  min-width: 10rem;
}
</style>
