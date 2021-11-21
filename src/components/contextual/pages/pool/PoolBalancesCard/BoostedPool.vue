<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { flatten } from 'lodash';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useTokens from '@/composables/useTokens';

import AssetRow from './components/AssetRow';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  loading: boolean;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { explorerLinks } = useWeb3();
const { getToken } = useTokens();

/**
 * COMPUTED
 */
const totalFiatValue = computed(() => {
  const fiatValue = flatten(
    props.pool.tokenAddresses.map(address => getUnderlyingTokens(address))
  )
    .map(token =>
      toFiat(
        formatUnits(token.balance, getToken(token.address).decimals),
        token.address
      )
    )
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
function getUnderlyingTokens(address: string) {
  const linearPools = props.pool.onchain.linearPools;

  return linearPools != null
    ? [linearPools[address].mainToken, linearPools[address].wrappedToken]
    : [];
}
</script>

<template>
  <BalCard
    class="overflow-x-auto whitespace-nowrap"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <template #header>
      <div
        class="p-4 w-full grid grid-cols-3 border-b dark:border-gray-900 text-base font-semibold"
      >
        <div>{{ $t('token') }}</div>
        <div class="justify-self-end">{{ $t('balance') }}</div>
        <div class="justify-self-end">{{ $t('value') }}</div>
      </div>
    </template>

    <div class="p-4 -mt-2">
      <div v-for="address in pool.tokenAddresses" :key="address" class="py-4">
        <BalBreakdown
          :items="getUnderlyingTokens(address)"
          class="w-full"
          size="lg"
        >
          <BalLink
            :href="explorerLinks.addressLink(address)"
            external
            noStyle
            class="flex items-center"
          >
            <BalAsset :address="address" class="mr-2" />
            {{ pool.onchain.tokens[address].symbol }}
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
            />
          </BalLink>
          <template #item="{ item: asset }">
            <AssetRow :address="asset.address" :balance="asset.balance" />
          </template>
        </BalBreakdown>
      </div>
    </div>

    <template #footer>
      <div
        class="flex w-full justify-between p-4 border-t dark:border-gray-900 text-base font-semibold"
      >
        <div>{{ $t('total') }}</div>
        <div>{{ totalFiatValue }}</div>
      </div>
    </template>
  </BalCard>
</template>
