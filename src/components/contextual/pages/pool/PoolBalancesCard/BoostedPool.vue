<script setup lang="ts">
import { defineProps } from 'vue';

import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';

import useBreakpoints from '@/composables/useBreakpoints';

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
const { explorerLinks } = useWeb3();

/**
 * METHODS
 */
function getUnderlyingTokens(address: string) {
  const linearPools = props.pool.onchain.linearPools;

  if (linearPools == null) {
    return [];
  }

  const tokenPriceAddress = linearPools[address].mainToken.address;

  return linearPools != null
    ? [
        linearPools[address].mainToken,
        {
          ...linearPools[address].wrappedToken,
          tokenPriceAddress
        }
      ]
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
          offsetClassOverrides="mt-4 ml-3"
          initVertBarClassOverrides="h-6 -mt-6"
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
            <AssetRow
              :address="asset.address"
              :token-price-address="asset.tokenPriceAddress"
              :balance="asset.balance"
              :price-rate="asset.priceRate"
            />
          </template>
        </BalBreakdown>
      </div>
    </div>
  </BalCard>
</template>
