<template>
  <div>
    <h4>Balances</h4>
    <div
      v-for="(address, index) in tokens"
      :key="address"
      class="mt-3 flex justify-between"
    >
      <span>
        <Avatar :address="address" :size="24" />
        <span class="ml-2">
          {{ getSymbol(address) }}
        </span>
      </span>
      <span>
        {{ getBalance(index) }}
      </span>
    </div>
  </div>
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
    }
  },
  setup(props) {
    const store = useStore();

    const { tokens, balances } = toRefs(props);

    const allTokens = computed(() => store.getters['registry/getTokens']());

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
      return b.toString();
    }

    return {
      getSymbol,
      getBalance
    };
  }
});
</script>
