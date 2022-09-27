<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';

import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
import useStaking from '@/composables/staking/useStaking';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import PoolActionsCard from './PoolActionsCard.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { tokens, balances, balanceFor, getTokens } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { isWalletReady } = useWeb3();
const { isStableLikePool, isMigratablePool, isDeepPool } = usePool(
  toRef(props, 'pool')
);
const {
  userData: { stakedSharesForProvidedPool },
} = useStaking();
const router = useRouter();

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

const poolTokens = computed(() =>
  Object.values(getTokens(props.pool.tokensList))
);

const propTokenAmounts = computed((): string[] => {
  const { receive } = poolCalculator.propAmountsGiven(
    bnum(bptBalance.value).plus(stakedSharesForProvidedPool.value).toString(),
    0,
    'send'
  );

  if (isDeepPool.value) {
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
  if (isDeepPool.value) {
    // We're using mainToken balances for StablePhantom pools
    // so return mainTokens here so that fiat values are correct.
    return props.pool.mainTokens || [];
  }
  return props.pool.tokensList;
});

const fiatValue = computed(() =>
  tokenAddresses.value
    .map((address, i) => toFiat(propTokenAmounts.value[i], address))
    .reduce((total, value) => bnum(total).plus(value).toString())
);

const showMigrateButton = computed(
  () =>
    (bnum(bptBalance.value).gt(0) ||
      bnum(stakedSharesForProvidedPool.value).gt(0)) &&
    isMigratablePool(props.pool)
);

/**
 * METHODS
 */
function weightLabelFor(address: string): string {
  if (!props.pool || !props.pool) return '-';
  const weight = props.pool?.onchain?.tokens?.[address]?.weight;
  return weight
    ? fNum2(weight, {
        style: 'percent',
        maximumFractionDigits: 0,
      })
    : '-';
}

function fiatLabelFor(index: number, address: string): string {
  const fiatValue = toFiat(propTokenAmounts.value[index], address);
  return fNum2(fiatValue, FNumFormats.fiat);
}

function navigateToPoolMigration(pool: Pool) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: POOL_MIGRATIONS_MAP[pool.id].toPoolId,
    },
    query: {
      returnRoute: 'pool',
      returnParams: JSON.stringify({ id: pool.id }),
    },
  });
}
</script>

<template>
  <BalCard shadow="2xl" noPad class="rounded-xl">
    <template #header>
      <div class="card-header">
        <h5>
          {{ $t('poolTransfer.myPoolBalancesCard.title') }}
        </h5>
        <h5>
          {{ isWalletReady ? fNum2(fiatValue, FNumFormats.fiat) : '-' }}
        </h5>
      </div>
    </template>
    <div class="py-2 px-4">
      <div
        v-for="(address, index) in tokenAddresses"
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
            <span class="text-sm text-secondary">
              {{ poolTokens[index].name }}
            </span>
          </div>
        </div>

        <span class="flex flex-col flex-grow text-right">
          {{
            isWalletReady
              ? fNum2(propTokenAmounts[index], FNumFormats.token)
              : '-'
          }}
          <span class="text-sm text-secondary">
            {{ isWalletReady ? fiatLabelFor(index, address) : '-' }}
          </span>
        </span>
      </div>
      <BalBtn
        v-if="showMigrateButton"
        color="blue"
        class="mt-4"
        block
        @click.prevent="navigateToPoolMigration(props.pool)"
      >
        {{ $t('migratePool.migrateLiquidity') }}
      </BalBtn>
    </div>
    <template #footer>
      <PoolActionsCard :pool="pool" :missingPrices="missingPrices" />
    </template>
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
