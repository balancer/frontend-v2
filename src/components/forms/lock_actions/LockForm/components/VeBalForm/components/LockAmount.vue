<script setup lang="ts">
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenInfo } from '@/types/TokenList';
import { computed } from 'vue';

import useLockState from '../../../composables/useLockState';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { lockAmount } = useLockState();

/**
 * COMPUTED
 */
const lockAmountFiatValue = computed(() =>
  bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(lockAmount.value)
);
</script>

<template>
  <div class="mb-6">
    <div class="pb-4">
      {{ $t('getVeBAL.lockForm.lockAmount.title') }}
    </div>
    <TokenInput
      :address="lockablePoolTokenInfo.address"
      :tokenValue="lockAmountFiatValue"
      v-model:amount="lockAmount"
      fixedToken
      name="lockAmount"
    />
  </div>
</template>
