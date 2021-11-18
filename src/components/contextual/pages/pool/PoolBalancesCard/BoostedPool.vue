<script setup lang="ts">
import { computed, defineProps } from 'vue';

import { FullPool } from '@/services/balancer/subgraph/types';

import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';

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
const { fNum } = useNumbers();
const { currency } = useUserSettings();
const { explorerLinks } = useWeb3();

/**
 * COMPUTED
 */
// TODO: implement
const totalFiat = computed(() => {
  return fNum(0, currency.value);
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
            <div class="grid grid-cols-3">
              <AssetRow :address="asset.address" :balance="asset.balance" />
            </div>
          </template>
        </BalBreakdown>
      </div>
    </div>

    <template #footer>
      <div
        class="flex w-full justify-between p-4 border-t dark:border-gray-900 text-base font-semibold"
      >
        <div>{{ $t('total') }}</div>
        <div>{{ totalFiat }}</div>
      </div>
    </template>
  </BalCard>
</template>
