<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

import { bnum } from '@/lib/utils';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const bptBalance = computed(() => balanceFor(props.lockablePool.address));

const fiatTotal = computed(() =>
  bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(bptBalance.value)
);
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.lockableTokens.title') }}
      </h6>
    </div>
    <div class="-mt-2 p-4">
      <div class="flex justify-between">
        <div>{{ lockablePoolTokenInfo.symbol }}</div>
        <div>{{ fNum2(bptBalance, FNumFormats.token) }}</div>
      </div>
      <div class="flex justify-between text-gray-500">
        <div>{{ lockablePoolTokenInfo.name }}</div>
        <div>{{ fNum2(fiatTotal, FNumFormats.fiat) }}</div>
      </div>
      <BalLink
        tag="router-link"
        :to="{ name: 'invest', params: { id: lockablePool.id } }"
        external
        class="mt-2 block text-sm"
      >
        {{
          $t('getVeBAL.lockableTokens.getMoreVeBAL', [
            lockablePoolTokenInfo.symbol
          ])
        }}
      </BalLink>
    </div>
  </BalCard>
</template>
