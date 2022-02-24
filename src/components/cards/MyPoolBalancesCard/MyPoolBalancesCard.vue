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
import { getAddress } from '@ethersproject/address';
import { usePool } from '@/composables/usePool';
import { keyBy } from 'lodash';
import usePools from '@/composables/pools/usePools';

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
const { tokens, balances, balanceFor } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isStablePhantomPool } = usePool(toRef(props, 'pool'));
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

/**
 * COMPUTED
 */
const propTokenAmounts = computed((): string[] => {
  const pool = props.pool;
  const farm = props.pool.decoratedFarm;
  const userBalance = parseFloat(balanceFor(getAddress(props.pool.address)));
  const farmBalance = farm ? farm.userBpt : 0;

  const { receive } = poolCalculator.propAmountsGiven(
    `${userBalance + farmBalance}`,
    0,
    'send'
  );

  if (pool.mainTokens) {
    const tokenAddresses = props.pool.tokenAddresses;

    return pool.mainTokens.map(mainToken => {
      if (tokenAddresses.includes(mainToken)) {
        //this mainToken is a base asset on the pool, not nested
        const index = tokenAddresses.indexOf(mainToken);

        return receive[index];
      }

      //find the linear pool for this mainToken if there is one
      const linearPool = pool.linearPools?.find(
        linearPool => linearPool.mainToken.address === mainToken
      );

      if (linearPool) {
        const linearPoolAddress = getAddress(linearPool.address);

        if (tokenAddresses.includes(linearPoolAddress)) {
          //the linear pool BPT is nested in this pool
          const index = tokenAddresses.indexOf(linearPoolAddress);

          return bnum(receive[index])
            .times(linearPool.priceRate)
            .toString();
        } else {
          // this linear pool BPT is nested in a stable phantom BPT
          const stablePhantomPool = pools.value.find(
            pool =>
              pool.poolType === 'StablePhantom' &&
              tokenAddresses.includes(getAddress(pool.address))
          );

          if (stablePhantomPool) {
            const index = tokenAddresses.indexOf(
              getAddress(stablePhantomPool.address)
            );
            const bptBalance = receive[index];
            return bnum(bptBalance)
              .div(stablePhantomPool.totalShares)
              .times(linearPool.totalSupply)
              .times(linearPool.priceRate)
              .toString();
          }
        }
      }

      return '0';
    });
  }

  return receive;
});

const tokenAddresses = computed((): string[] => {
  if (props.pool.mainTokens) {
    // We're using mainToken balances for StablePhantom pools
    // so return mainTokens here so that fiat values are correct.
    return props.pool.mainTokens;
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
