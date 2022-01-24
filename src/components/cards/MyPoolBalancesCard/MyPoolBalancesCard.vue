<script setup lang="ts">
import { computed, toRef, ref } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
// Composables
import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
// Components
import AssetRow from './components/AssetRow.vue';
import { usePool } from '@/composables/usePool';

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
const { fNum2, toFiat } = useNumbers();
const { isStablePhantomPool } = usePool(toRef(props, 'pool'));

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

  if (isStablePhantomPool.value) {
    // Return linear pool's main token balance using the price rate.
    // mainTokenBalance = linearPoolBPT * priceRate
    return props.pool.tokenAddresses.map((address, i) => {
      if (!props.pool.onchain.linearPools) return '0';

      const priceRate = props.pool.onchain.linearPools[address].priceRate;

      return bnum(receive[i])
        .times(priceRate)
        .toString();
    });
  }

  return receive;
});

const tokenAddresses = computed((): string[] => {
  if (isStablePhantomPool.value) {
    // We're using mainToken balances for StablePhantom pools
    // so return mainTokens here so that fiat values are correct.
    return props.pool.mainTokens || [];
  }
  return props.pool.tokenAddresses;
});

const fiatTotal = computed(() => {
  const fiatValue = tokenAddresses.value
    .map((address, i) => toFiat(propTokenAmounts.value[i], address))
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    );
  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-900">
        <h6>
          {{ $t('poolTransfer.myPoolBalancesCard.title') }}
        </h6>
      </div>
    </template>

    <div class="-mt-2 p-4">
      <div v-for="(address, i) in tokenAddresses" :key="address" class="py-2">
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
