<template>
  <BalCard class="overflow-x-auto whitespace-nowrap" no-pad>
    <table class="min-w-full dark:bg-gray-900">
      <tr class="bg-gray-50 dark:bg-gray-700">
        <th class="sticky top-0 p-2 pl-5 py-5 text-left" v-text="$t('token')" />
        <th class="sticky top-0 p-2 py-5 text-right" v-text="$t('weight')" />
        <th
          class="sticky top-0 p-2 py-5 text-right"
          v-text="$t('poolBalance')"
        />
        <th
          class="sticky top-0 p-2 pr-5 py-5 text-right"
          v-text="$t('poolValue')"
        />
      </tr>
      <tr
        class="hover:bg-gray-50"
        v-for="(address, index) in tokens"
        :key="address"
      >
        <td class="p-2 pl-5 py-5 flex items-center text-left">
          <a :href="_explorer(networkId, address)" target="_blank">
            <Avatar :address="address" :size="24" />
            <span class="pl-4">
              {{ getSymbol(address) }}
            </span>
          </a>
        </td>
        <td class="p-2 py-5 text-right">
          {{ getWeight(index) }}
          %
        </td>
        <td class="p-2 py-5 text-right">
          {{ _num(getBalance(index), '0,0.00') }}
        </td>
        <td class="p-2 pr-5 py-5 text-right">
          {{ 0 == getValue(index) ? '?' : _num(getValue(index), '$0,0.00') }}
        </td>
      </tr>
    </table>
  </BalCard>
</template>

<script lang="ts">
import { PropType, defineComponent, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

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
    }
  },
  setup(props) {
    const store = useStore();

    const { tokens, balances, weights } = toRefs(props);

    const allTokens = computed(() => store.getters['registry/getTokens']());

    const networkId = computed(() => store.state.web3.config.chainId);
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

    function getSymbol(address: string) {
      const token = allTokens.value[address];
      return token ? token.symbol : address;
    }

    function getBalance(index: number) {
      const address = tokens.value[index];
      const balance = balances.value[index].toString();
      const token = allTokens.value[address];
      const decimals = token ? token.decimals : 18;
      const b = formatUnits(balance, decimals);
      return b;
    }

    function getWeight(index: number) {
      return weights.value[index];
    }

    function getValue(index: number) {
      return tokenValues.value[index] || 0;
    }

    return {
      getSymbol,
      getBalance,
      getWeight,
      getValue,
      networkId
    };
  }
});
</script>
