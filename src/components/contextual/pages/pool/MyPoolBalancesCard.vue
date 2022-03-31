<script setup lang="ts">
import { toRef, computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { bnum } from '@/lib/utils';

import { MIN_FIAT_VALUE_POOL_MIGRATION } from '@/constants/pools';

import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';

import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';

import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
import { PoolMigrationType } from '@/components/forms/pool_actions/MigrateForm/types';
import PoolActionsCard from './PoolActionsCard.vue';
import useStaking from '@/composables/staking/useStaking';

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
const { tokens, balances, balanceFor, getTokens } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { isWalletReady } = useWeb3();
const { isStableLikePool, isStablePhantomPool, isMigratablePool } = usePool(
  toRef(props, 'pool')
);
const { stakedSharesForProvidedPool } = useStaking();
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
  Object.values(getTokens(props.pool.tokenAddresses))
);

const propTokenAmounts = computed((): string[] => {
  const { receive } = poolCalculator.propAmountsGiven(
    bnum(bptBalance.value)
      .plus(stakedSharesForProvidedPool.value)
      .toString(),
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

const fiatValue = computed(() =>
  tokenAddresses.value
    .map((address, i) => toFiat(propTokenAmounts.value[i], address))
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    )
);

const showMigrateButton = computed(
  () =>
    bnum(bptBalance.value).gt(0) &&
    isMigratablePool(props.pool) &&
    // TODO: this is a temporary solution to allow only big holders to migrate due to gas costs.
    bnum(fiatValue.value).gt(MIN_FIAT_VALUE_POOL_MIGRATION)
);
/**
 * METHODS
 */
function weightLabelFor(address: string): string {
  return fNum2(props.pool.onchain.tokens[address].weight, {
    style: 'percent',
    maximumFractionDigits: 0
  });
}

function fiatLabelFor(index: number, address: string): string {
  const fiatValue = toFiat(propTokenAmounts.value[index], address);
  return fNum2(fiatValue, FNumFormats.fiat);
}

function navigateToPoolMigration(pool: FullPool) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: POOL_MIGRATIONS_MAP[PoolMigrationType.AAVE_BOOSTED_POOL].toPoolId
    },
    query: {
      returnRoute: 'pool',
      returnParams: JSON.stringify({ id: pool.id })
    }
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
    <div class="px-4 py-2">
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
            <span class="text-gray-500 text-sm">
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
          <span class="text-gray-500 text-sm">
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
        {{ $t('migratePool.migrateToBoostedPool') }}
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
