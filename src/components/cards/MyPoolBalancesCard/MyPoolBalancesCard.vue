<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
// Composables
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

// Components
import AssetRow from './components/AssetRow.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  hideHeader?: boolean;
};
/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false,
});

/**
 * COMPOSABLES
 */
const { tokens, balances, balanceFor, getToken } = useTokens();
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
    return props.pool.tokensList.map((address, i) => {
      if (!props.pool?.onchain?.linearPools) return '0';

      const priceRate = props.pool.onchain.linearPools[address].priceRate;

      return bnum(receive[i]).times(priceRate).toString();
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
  return props.pool.tokensList;
});

const poolTokens = computed<string[]>(() =>
  tokenAddresses.value.map(address => {
    const token = getToken(address);
    return token.symbol;
  })
);

const bpt = computed<TokenInfo>(() => getToken(props.pool.address));

const fiatTotal = computed(() => {
  const fiatValue = tokenAddresses.value
    .map((address, i) => toFiat(propTokenAmounts.value[i], address))
    .reduce((total, value) => bnum(total).plus(value).toString());
  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-900">
        <h6>
          {{ $t('poolTransfer.myPoolBalancesCard.altTitle') }}
        </h6>
      </div>
    </template>

    <div v-if="isStablePhantomPool" class="-mt-2">
      <div class="p-4 w-full font-medium border-b dark:border-gray-900">
        <div class="flex justify-between align-baseline">
          <span>{{ bpt.symbol }}</span>
          <span>
            {{ fiatTotal }}
          </span>
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ bpt.name }}
        </span>
      </div>
      <div class="p-4">
        <div class="mb-2 text-sm text-gray-600 dark:text-gray-400">
          {{ $t('poolTransfer.myPoolBalancesCard.underlyingTokens') }}
        </div>
        <div class="flex flex-row flex-wrap gap-2">
          <div
            v-for="(address, i) in tokenAddresses"
            :key="address"
            class="flex gap-2 items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-0"
          >
            <BalAsset :key="address" :address="address" />{{ poolTokens[i] }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="p-4 -mt-2">
      <div v-for="(address, i) in tokenAddresses" :key="address" class="py-2">
        <AssetRow :address="address" :balance="propTokenAmounts[i]" />
      </div>
      <div class="flex justify-between pt-4 font-medium">
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
