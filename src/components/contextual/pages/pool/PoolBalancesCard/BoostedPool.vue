<script setup lang="ts">
import { computed, defineProps } from 'vue';

import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import AssetRow from './components/AssetRow.vue';
import { getAddress } from '@ethersproject/address';
import { keyBy } from 'lodash';

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

const baseTokens = computed(() => {
  return props.pool.tokens.filter(token => !token.isBpt && !token.isPhantomBpt);
});

/**
 * METHODS
 */
function getUnderlyingTokens(address: string) {
  address = getAddress(address);
  const linearPools = keyBy(props.pool.linearPools, pool =>
    getAddress(pool.address)
  );

  if (!linearPools) {
    return [];
  }

  const mainTokenAddress = linearPools[address].mainToken.address;

  return [
    linearPools[address].mainToken,
    {
      ...linearPools[address].wrappedToken,
      mainTokenAddress
    }
  ];
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
      <div v-for="token in baseTokens" :key="token.address" class="py-4">
        <AssetRow
          :address="token.address"
          :balance="token.balance"
          :share="1"
        />
      </div>
      <div
        v-for="linearPool in pool.linearPools"
        :key="linearPool.address"
        class="py-4"
      >
        <BalBreakdown
          :items="getUnderlyingTokens(linearPool.address)"
          class="w-full"
          offsetClassOverrides="mt-4 ml-3"
          initVertBarClassOverrides="h-6 -mt-6"
          size="lg"
        >
          <BalLink
            :href="explorerLinks.addressLink(getAddress(linearPool.address))"
            external
            noStyle
            class="flex items-center"
          >
            <BalAsset :address="linearPool.address" class="mr-2" />
            {{ linearPool.symbol }}
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
            />
          </BalLink>
          <template #item="{ item: asset }">
            <AssetRow
              :address="asset.address"
              :main-token-address="asset.mainTokenAddress"
              :balance="asset.balance"
              :price-rate="asset.priceRate"
              :share="1"
            />
          </template>
        </BalBreakdown>
      </div>
    </div>
  </BalCard>
</template>
