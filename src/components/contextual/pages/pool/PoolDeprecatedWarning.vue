<script setup lang="ts">
import { Pool } from '@/services/pool/types';

import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { bnum } from '@/lib/utils';
import { useTokens } from '@/providers/tokens.provider';

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

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();
const { stakedShares } = usePoolStaking();

/**
 * COMPUTED
 */
const hasBalance = computed(() =>
  bnum(balanceFor(props.pool.address)).plus(stakedShares.value).gt(0)
);
</script>

<template>
  <BalAlert
    v-if="hasBalance"
    type="tip"
    class="mb-4"
    :title="$t('deprecatedPool.warning.title')"
    :description="$t('deprecatedPool.warning.text')"
  />
</template>