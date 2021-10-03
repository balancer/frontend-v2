<script setup lang="ts">
import { computed } from 'vue';
import useTokens from '@/composables/useTokens';
import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfoMap } from '@/types/TokenList';
import { bnum } from '@/lib/utils';
import useNumbers from '@/composables/useNumbers';
import InvestSummary from './components/InvestSummary.vue';
import TokenInputs from './components/TokenInputs.vue';
import InvestSteps from './components/InvestActions.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  fullAmounts: string[];
  priceImpact: number;
};

type AmountMap = {
  [address: string]: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'invest'): void;
}>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { toFiat } = useNumbers();

/**
 * COMPUTED
 */
const tokenAddresses = computed((): string[] => props.pool.tokenAddresses);

const amountMap = computed(
  (): AmountMap => {
    const amountMap = {};
    props.fullAmounts.forEach((amount, i) => {
      if (hasAmount(i)) amountMap[tokenAddresses.value[i]] = amount;
    });
    return amountMap;
  }
);

const tokenMap = computed(
  (): TokenInfoMap => {
    const tokenMap = {};
    Object.keys(amountMap.value).forEach(address => {
      tokenMap[address] = getToken(address);
    });
    return tokenMap;
  }
);

const fiatAmountMap = computed(
  (): AmountMap => {
    const fiatAmountMap = {};
    Object.keys(amountMap.value).forEach(address => {
      fiatAmountMap[address] = toFiat(amountMap.value[address], address);
    });
    return fiatAmountMap;
  }
);

const fiatTotal = computed((): string =>
  Object.values(fiatAmountMap.value).reduce(
    (total, amount) =>
      bnum(total)
        .plus(amount)
        .toString(),
    '0'
  )
);

/**
 * METHODS
 */
function hasAmount(index: number): boolean {
  return bnum(props.fullAmounts[index]).gt(0);
}
</script>

<template>
  <BalModal title="Investment preview" show @close="emit('close')">
    <TokenInputs
      :amountMap="amountMap"
      :tokenMap="tokenMap"
      :fiatAmountMap="fiatAmountMap"
      :fiatTotal="fiatTotal"
    />

    <InvestSummary
      :pool="pool"
      :fiatTotal="fiatTotal"
      :priceImpact="priceImpact"
    />

    <InvestActions
      :pool="pool"
      :fullAmounts="fullAmounts"
      class="my-4 flex justify-center"
    />
  </BalModal>
</template>
