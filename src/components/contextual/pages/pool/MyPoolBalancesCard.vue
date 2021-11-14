<script setup lang="ts">
import { toRef, onBeforeMount, computed, ref } from 'vue';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';
import { usePool } from '@/composables/usePool';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { getAddress } from '@ethersproject/address';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { initMath } = useWithdrawMath(toRef(props, 'pool'));
const { getTokens, tokens, balances, balanceFor } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isWalletReady } = useWeb3();
const { isStableLikePool } = usePool(toRef(props, 'pool'));

const fiatTotalLabel = computed(() => {
  const pool = props.pool;

  return fNum(parseFloat(pool.shares || '0') + (pool.farm?.stake || 0), 'usd', {
    forcePreset: true
  });
});

const poolCalculator = new PoolCalculator(
  toRef(props, 'pool'),
  tokens,
  balances,
  'exit',
  ref(false)
);

const proportionalAmounts = computed((): string[] => {
  const farm = props.pool.farm;
  const userBalance = parseFloat(balanceFor(getAddress(props.pool.address)));
  const farmBalance = farm ? farm.userBpt : 0;

  const { receive } = poolCalculator.propAmountsGiven(
    `${userBalance + farmBalance}`,
    0,
    'send'
  );
  return receive;
});

/**
 * COMPUTED
 */
const poolTokens = computed(() => getTokens(props.pool.tokenAddresses));

/**
 * METHODS
 */
function weightLabelFor(address: string): string {
  return fNum(props.pool.onchain.tokens[address].weight, 'percent_lg');
}

function fiatLabelFor(index: number, address: string): string {
  const fiatValue = toFiat(proportionalAmounts.value[index], address);
  return fNum(fiatValue, currency.value);
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  initMath();
});
</script>

<template>
  <BalCard noPad>
    <template #header>
      <div class="card-header">
        <h5>
          {{ $t('poolTransfer.myPoolBalancesCard.title') }}
        </h5>
        <h5>
          {{ isWalletReady ? fiatTotalLabel : '-' }}
        </h5>
      </div>
    </template>
    <div class="px-4 py-2">
      <div
        v-for="(token, _, index) in poolTokens"
        :key="token.address"
        class="asset-row"
      >
        <div class="flex items-center">
          <BalAsset :address="token.address" :size="36" class="mr-4" />
          <div class="flex flex-col">
            <span>
              <span v-if="!isStableLikePool">
                {{ weightLabelFor(token.address) }}
              </span>
              {{ token.symbol }}
            </span>
            <span class="text-gray-500 text-sm">
              {{ token.name }}
            </span>
          </div>
        </div>

        <span class="flex flex-col flex-grow text-right">
          {{ isWalletReady ? fNum(proportionalAmounts[index], 'token') : '-' }}
          <span class="text-gray-500 text-sm">
            {{ isWalletReady ? fiatLabelFor(index, token.address) : '-' }}
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
