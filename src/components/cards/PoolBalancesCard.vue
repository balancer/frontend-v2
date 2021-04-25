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
          <BalLink :href="explorer.addressLink(address)" external>
            <Avatar :address="address" :size="24" />
            <span class="pl-4">
              {{ symbolFor(address) }}
            </span>
          </BalLink>
        </td>
        <td class="p-2 py-5 text-right">
          {{ weightFor(index) }}
        </td>
        <td class="p-2 py-5 text-right">
          {{ balanceFor(index) }}
        </td>
        <td class="p-2 pr-5 py-5 text-right">
          {{ fiatValueFor(index) }}
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
    missingPrices: { type: Boolean, default: false }
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
      explorer
    };
  }
});
</script>
