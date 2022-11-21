<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, toRefs } from 'vue';
import { useTokenBreakdown } from './composables/useTokenBreakdown';
import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
type Props = {
  token: PoolToken;
  shareOfParentInPool?: number;
  padding: number;
  isWeighted: boolean;
  isDeepPool: boolean;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  shareOfParentInPool: 1,
});

const { token, shareOfParentInPool, padding, isWeighted, isDeepPool } =
  toRefs(props);

/**
 * COMPOSABLES
 */
const { explorerLinks } = useWeb3();

const { balanceLabel, fiatLabel, tokenWeightLabel } = useTokenBreakdown(
  token,
  shareOfParentInPool,
  isDeepPool
);

/**
 * COMPUTED
 */
const nestedPadding = computed(() => padding.value + 6);

const isLeaf = computed((): boolean => !token.value.token.pool);

// If this token is a pool, this is the share of that pool in it's parent.
// e.g. The share of bb-a-DAI in bb-a-USD, since bb-a-DAI can be used in
// multiple pools.
const shareOfTokenInPool = computed((): number => {
  if (isLeaf.value) return 1;

  return bnum(token.value?.balance || '0')
    .div(token.value.token.pool?.totalShares || 1)
    .toNumber();
});
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
      :shareOfParentInPool="shareOfTokenInPool"
      :padding="nestedPadding"
      :isWeighted="isWeighted"
      :isDeepPool="isDeepPool"
    />
  </template>
</template>
