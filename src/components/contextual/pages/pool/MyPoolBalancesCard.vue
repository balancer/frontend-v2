<script setup lang="ts">
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { toRef, computed, ref } from 'vue';
import { FullPool, FullPoolWithFarm } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';
import { usePool } from '@/composables/usePool';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { getAddress } from '@ethersproject/address';
import { bnum } from '@/lib/utils';
import { useBoostedPool } from '@/composables/useBoostedPool';
import usePools from '@/composables/pools/usePools';
import useConfig from '@/composables/useConfig';
import { sum } from 'lodash';

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
const { tokens, balances, balanceFor, getTokens } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isWalletReady } = useWeb3();
const { isStableLikePool } = usePool(toRef(props, 'pool'));
const { pools } = usePools();
const { networkConfig } = useConfig();

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

const { userBoostedPoolBalance } = useBoostedPool(
  toRef(props, 'pool'),
  poolCalculator,
  //@ts-ignore
  pools
);

const propTokenAmounts = computed((): string[] => {
  return userBoostedPoolBalance.value;
});

const tokenAddresses = computed((): string[] => {
  if (props.pool.mainTokens) {
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
  return fNum(fiatValue, currency.value);
});

/**
 * METHODS
 */
function weightLabelFor(address: string): string {
  return fNum(props.pool.onchain.tokens[address].weight, 'percent_lg');
}

function fiatLabelFor(index: number, address: string): string {
  const mainTokens = props.pool.mainTokens || [];
  if (address.toLowerCase() === networkConfig.addresses.bbUsd.toLowerCase()) {
    //pool has bbUsd nested
    const fiatValue = sum(
      mainTokens.map((mainToken, index) => {
        if (networkConfig.usdTokens.includes(mainToken)) {
          return parseFloat(toFiat(propTokenAmounts.value[index], mainToken));
        }
      })
    );

    return fNum(fiatValue, currency.value);
  } else if (
    props.pool.linearPoolToMainTokenMap &&
    props.pool.linearPoolToMainTokenMap[address.toLowerCase()]
  ) {
    const mainToken = props.pool.linearPoolToMainTokenMap[
      address.toLowerCase()
    ].toLowerCase();

    const mainTokenIndex = mainTokens.findIndex(
      token => token.toLowerCase() === mainToken
    );

    const fiatValue = toFiat(
      propTokenAmounts.value[mainTokenIndex],
      props.pool.linearPoolToMainTokenMap[address.toLowerCase()]
    );
    return fNum(fiatValue, currency.value);
  }

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
