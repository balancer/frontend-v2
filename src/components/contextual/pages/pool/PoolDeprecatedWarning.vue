<script setup lang="ts">
import { Pool } from '@/services/pool/types';

import { usePoolStaking } from '@/providers/local/pool-staking.provider';
import { bnum } from '@/lib/utils';
import { useTokens } from '@/providers/tokens.provider';
import useNetwork from '@/composables/useNetwork';

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
const { networkSlug } = useNetwork();
const router = useRouter();

/**
 * COMPUTED
 */
const hasBalance = computed(() =>
  bnum(balanceFor(props.pool.address)).plus(stakedShares.value).gt(0)
);

const poolRoute = computed(
  () =>
    router.resolve({
      name: 'pool',
      params: { id: props.pool.id, networkSlug },
    }).fullPath
);
</script>

<template>
  <BalAlert
    v-if="hasBalance"
    type="tip"
    class="mb-4"
    :title="$t('deprecatedPool.warning.title')"
  >
    <span>{{ $t('deprecatedPool.warning.text') }}</span>
    &nbsp;
    <BalLink tag="router-link" :to="poolRoute">inventivized pool</BalLink>.
  </BalAlert>
</template>
