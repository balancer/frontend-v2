<script setup lang="ts">
import { computed } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import useLockState from '../../../composables/useLockState';

/**
 * TYPES
 */
type Props = {
  lockablePool: Pool;
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
    .toString()
);
</script>

<template>
  <div class="mb-6">
    <div>
      <p class="pb-2 font-semibold">
        {{ $t('getVeBAL.lockForm.lockAmount.title') }}
      </p>
    </div>
    <TokenInput
      v-model:amount="lockAmount"
      :address="lockablePoolTokenInfo.address"
      :tokenValue="lockAmountFiatValue"
      fixedToken
      name="lockAmount"
    />
  </div>
</template>
