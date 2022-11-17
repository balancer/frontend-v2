<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, toRefs } from 'vue';
import { findMainTokenAddress } from '@/composables/usePool';
import { useTokenBreakdown } from './composables/useTokenBreakdown';

/**
 * TYPES
 */
type Props = {
  token: PoolToken;
  parentTotalShare: string;
  mainTokenAddress: string;
  padding: number;
  isWeighted: boolean;
  isDeepPool: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

const {
  token,
  parentTotalShare,
  mainTokenAddress,
  padding,
  isWeighted,
  isDeepPool,
} = toRefs(props);

/**
 * COMPOSABLES
 */
const { explorerLinks } = useWeb3();

const mainTokenAddressForNextLevel = findMainTokenAddress(
  token.value?.token?.pool
);

const { balanceLabel, fiatLabel, tokenWeightLabel } = useTokenBreakdown(
  token,
  parentTotalShare,
  mainTokenAddress,
  isDeepPool
);

/**
 * COMPUTED
 */
const nestedPadding = computed(() => padding.value + 6);
</script>

<template>
  <div
    class="grid p-4 w-full"
    :class="[isWeighted ? 'grid-cols-4' : 'grid-cols-3', 'pl-' + padding]"
  >
    <BalLink
      :href="explorerLinks.addressLink(token.address)"
      external
      noStyle
      class="flex items-center"
    >
      <BalAsset :address="token.address" class="mr-2" />
      {{ token?.symbol || '---' }}
      <BalIcon
        name="arrow-up-right"
        size="sm"
        class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
      />
    </BalLink>
    <div v-if="isWeighted" class="justify-self-end">
      {{ tokenWeightLabel }}
    </div>
    <div class="justify-self-end">
      {{ balanceLabel }}
      <!-- {{ token.priceRate }} -->
    </div>
    <div class="justify-self-end">
      {{ fiatLabel }}
    </div>
  </div>

  <template v-if="isDeepPool">
    <TokenBreakdown
      v-for="nestedToken in token.token?.pool?.tokens"
      :key="nestedToken.address"
      :token="nestedToken"
      :parentTotalShare="token.token.pool?.totalShares"
      :mainTokenAddress="mainTokenAddressForNextLevel"
      :padding="nestedPadding"
      :isWeighted="isWeighted"
      :isDeepPool="isDeepPool"
    />
  </template>
</template>