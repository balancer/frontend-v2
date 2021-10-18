<script setup lang="ts">
import { computed, toRef, ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
// Composables
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
// Components
import AssetRow from './components/AssetRow.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  hideHeader?: boolean;
};
/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false
});

/**
 * COMPOSABLES
 */
const { tokens, balances, balanceFor } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();

/**
 * SERVICES
 */
const poolCalculator = new PoolCalculator(
  toRef(props, 'pool'),
  tokens,
  balances,
  'exit',
  ref(false)
);

/**
 * COMPUTED
 */
const bptBalance = computed((): string => balanceFor(props.pool.address));

const propTokenAmounts = computed((): string[] => {
  const { receive } = poolCalculator.propAmountsGiven(
    bptBalance.value,
    0,
    'send'
  );

  return receive;
});

const fiatTotal = computed(() => {
  const fiatValue = props.pool.tokenAddresses
    .map((address, i) => toFiat(propTokenAmounts.value[i], address))
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    );
  return fNum(fiatValue, currency.value);
});
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-700">
        <h6>
          {{ $t('investment.myPoolBalancesCard.title') }}
        </h6>
      </div>
    </template>

    <div class="-mt-3 p-4">
      <div
        v-for="(address, i) in pool.tokenAddresses"
        :key="address"
        class="py-3"
      >
        <AssetRow :address="address" :balance="propTokenAmounts[i]" />
      </div>
      <div class="pt-4 flex justify-between font-medium">
        <span>
          {{ $t('total') }}
        </span>
        <span class="text-right">
          {{ fiatTotal }}
        </span>
      </div>
    </div>
  </BalCard>
</template>
