<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { bnum } from '@/lib/utils';
import { parseUnits } from 'ethers/lib/utils';
import {
  getUnderlyingTokens,
  findTokenByAddress,
} from '@/services/balancer/subgraph/entities/pools/pools.builders';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { toRefs } from 'vue';

import AssetRow from './components/AssetRow.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { isWeightedLike } from '@/composables/usePool';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();
const { pool } = toRefs(props);
const isWeighted = isWeightedLike(pool.value.poolType);

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { explorerLinks } = useWeb3();
const { fNum2 } = useNumbers();
const { priceFor } = useTokens();

/**
 * METHODS
 */
function getTokenShare(address: string) {
  const linearPools = pool.value.onchain?.linearPools;

  if (linearPools == null) {
    return null;
  }

  const token = props.pool?.onchain?.tokens[address];

  return bnum(token?.balance || '0')
    .div(linearPools[address].totalSupply)
    .toString();
}

function convert(balance: string, decimals: number) {
  return parseUnits(balance, decimals).toString();
}

function hasNestedTokens(address: string) {
  return getUnderlyingTokens(pool.value, address).length;
}

function getRootTokenStyle(address) {
  // When there are nested tokens, the root token will have full width (just breakdown)
  if (hasNestedTokens(address)) return 'py-4';
  // When NO nested tokens, the root token will have 3 cols (breakdown + balance + value)
  if (isWeighted) return 'grid grid-cols-4 py-4';
  return 'grid grid-cols-3 py-4';
}

function weightFor(address: string) {
  const token = findTokenByAddress(pool.value, address);
  if (!token || !token.weight) return '-';
  return fNum2(token.weight, FNumFormats.percent);
}

function balanceFor(address: string) {
  const token = findTokenByAddress(pool.value, address);
  return token ? fNum2(token.balance, FNumFormats.token) : '-';
}

function fiatValueFor(address: string) {
  const token = findTokenByAddress(pool.value, address);
  if (!token || !token.balance) return '-';
  const price = priceFor(address);

  return fNum2(Number(token.balance) * price, FNumFormats.fiat);
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
        class="grid p-4 w-full text-base font-semibold border-b dark:border-gray-900"
        :class="[isWeighted ? 'grid-cols-4' : 'grid-cols-3']"
      >
        <div>{{ $t('token') }}</div>
        <div v-if="isWeighted" class="justify-self-end">
          {{ $t('weight') }}
        </div>
        <div class="justify-self-end">
          {{ $t('balance') }}
        </div>
        <div class="justify-self-end">
          {{ $t('value') }}
        </div>
      </div>
    </template>

    <div class="p-4 -mt-2">
      <div
        v-for="address in pool.tokensList"
        :key="address"
        :class="getRootTokenStyle(address)"
      >
        <BalBreakdown
          :items="getUnderlyingTokens(pool, address)"
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
            {{ findTokenByAddress(pool, address)?.symbol || '---' }}
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
            />
          </BalLink>
          <template #item="{ item: asset }">
            <AssetRow
              :address="asset.address"
              :mainTokenAddress="address"
              :balance="convert(asset.balance, asset.decimals)"
              :priceRate="asset.priceRate"
              :share="getTokenShare(address)"
            />
          </template>
        </BalBreakdown>
        <div v-if="isWeighted" class="justify-self-end">
          {{ weightFor(address) }}
        </div>
        <div v-if="!hasNestedTokens(address)" class="justify-self-end">
          {{ balanceFor(address) }}
        </div>
        <div v-if="!hasNestedTokens(address)" class="justify-self-end">
          {{ fiatValueFor(address) }}
        </div>
      </div>
    </div>
  </BalCard>
</template>
