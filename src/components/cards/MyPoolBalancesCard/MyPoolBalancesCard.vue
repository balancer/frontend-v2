<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { FullPoolWithFarm } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
// Composables
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
// Components
import AssetRow from './components/AssetRow.vue';
import { usePool } from '@/composables/usePool';
import usePools from '@/composables/pools/usePools';
import { useBoostedPool } from '@/composables/useBoostedPool';

/**
 * TYPES
 */
type Props = {
  pool: FullPoolWithFarm;
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
const { tokens, balances } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isBoostedPool } = usePool(toRef(props, 'pool'));
const { pools } = usePools();

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

const { userPoolBalance } = useBoostedPool(
  toRef(props, 'pool'),
  poolCalculator,
  //@ts-ignore
  pools
);

const propTokenAmounts = computed((): string[] => {
  return userPoolBalance.value;
});

/**
 * COMPUTED
 */
/*
const tokenAddresses = computed((): string[] => {
  if (props.pool.mainTokens) {
    // We're using mainToken balances for StablePhantom pools
    // so return mainTokens here so that fiat values are correct.
    return props.pool.mainTokens;
  }
  return props.pool.tokenAddresses;
});

const fiatTotal = computed(() => {
  if (isBoostedPool.value) {
    const fiatValue = boostedPoolUserMainTokenBalances.value
      .map((token, i) => toFiat(token.balance, token.address))
      .reduce((total, value) =>
        bnum(total)
          .plus(value)
          .toString()
      );
    return fNum(fiatValue, currency.value);
  }

  const fiatValue = tokenAddresses.value
    .map((address, i) => toFiat(userPoolBalance.value[i], address))
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    );
  return fNum(fiatValue, currency.value);
});*/

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

/**
 * METHODS
 */
function weightLabelFor(address: string): string {
  return fNum(props.pool.onchain.tokens[address].weight, 'percent_lg');
}

function fiatLabelFor(index: number, address: string): string {
  const fiatValue = toFiat(propTokenAmounts.value[index], address);
  return fNum(fiatValue, currency.value);
}
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-900">
        <h6>{{ $t('poolTransfer.myPoolBalancesCard.title') }}</h6>
      </div>
    </template>

    <div class="-mt-2 p-4">
      <div
        v-for="(address, index) in pool.tokenAddresses"
        :key="address"
        class="py-2"
      >
        <AssetRow :address="address" :balance="propTokenAmounts[index]" />
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
