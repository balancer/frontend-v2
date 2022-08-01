<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: Pool;
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

const fiatTotal = computed((): string =>
  bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(bptBalance.value)
    .toString()
);
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.lockableTokens.title') }}
      </h6>
    </div>
    <div class="p-4 -mt-2">
      <div class="flex justify-between">
        <div>{{ lockablePoolTokenInfo.symbol }}</div>
        <div>{{ fNum2(bptBalance, FNumFormats.token) }}</div>
      </div>
      <div class="flex justify-between text-secondary">
        <div>{{ lockablePoolTokenInfo.name }}</div>
        <div>{{ fNum2(fiatTotal, FNumFormats.fiat) }}</div>
      </div>
      <BalLink
        tag="router-link"
        :to="{ name: 'invest', params: { id: lockablePool.id } }"
        external
        class="block mt-2 text-sm"
      >
        {{
          $t('getVeBAL.lockableTokens.getMoreVeBAL', [
            lockablePoolTokenInfo.symbol,
          ])
        }}
      </BalLink>
    </div>
  </BalCard>
</template>
