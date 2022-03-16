<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { FullPoolWithFarm } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';
import { usePool } from '@/composables/usePool';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { bnum } from '@/lib/utils';
import { useBoostedPool } from '@/composables/useBoostedPool';

/**
 * TYPES
 */
type Props = {
  pool: FullPoolWithFarm;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { tokens, balances, balanceFor, getTokens, priceFor } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isWalletReady } = useWeb3();
const { isStableLikePool } = usePool(toRef(props, 'pool'));

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
const bptBalance = computed((): string => {
  const unstakedBalance = parseFloat(balanceFor(props.pool.address));
  const stakedBalance = props.pool.decoratedFarm?.userBpt || 0;

  return `${unstakedBalance + stakedBalance}`;
});

const poolTokens = computed(() =>
  Object.values(getTokens(props.pool.tokenAddresses))
);

const { userPoolBalance } = useBoostedPool(
  toRef(props, 'pool'),
  poolCalculator
);

const propTokenAmounts = computed((): string[] => {
  return userPoolBalance.value;
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
  <BalCard noPad>
    <template #header>
      <div class="card-header">
        <h5>{{ $t('poolTransfer.myPoolBalancesCard.title') }}</h5>
        <h5>
          {{ isWalletReady ? fiatTotal : '-' }}
        </h5>
      </div>
    </template>
    <div class="px-4 py-2">
      <div
        v-for="(address, index) in pool.tokenAddresses"
        :key="address"
        class="asset-row"
      >
        <div class="flex items-center">
          <BalAsset
            :address="poolTokens[index].address"
            :size="36"
            class="mr-4"
          />
          <div class="flex flex-col">
            <span>
              <span v-if="!isStableLikePool">
                {{ weightLabelFor(address) }}
              </span>
              {{ poolTokens[index].symbol }}
            </span>
            <span class="text-gray-500 text-sm">
              {{ poolTokens[index].name }}
            </span>
          </div>
        </div>

        <span class="flex flex-col flex-grow text-right">
          {{ isWalletReady ? fNum(propTokenAmounts[index], 'token') : '-' }}
          <span class="text-gray-500 text-sm">
            {{ isWalletReady ? fiatLabelFor(index, address) : '-' }}
          </span>
        </span>
      </div>
    </div>
  </BalCard>
</template>

<style scoped>
.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}

.asset-row {
  @apply py-3 flex justify-between items-center text-lg;
}
</style>
