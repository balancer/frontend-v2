<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import useNetwork from '@/composables/useNetwork';
import { deprecatedDetails } from '@/composables/usePool';

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
const { networkSlug } = useNetwork();
const router = useRouter();

/**
 * COMPUTED
 */
const newPoolId = computed(
  (): string | undefined => deprecatedDetails(props.pool.id)?.newPool
);

const poolRoute = computed(() => {
  console.log('newPoolId', newPoolId.value);
  if (!newPoolId.value) return undefined;

  return router.resolve({
    name: 'pool',
    params: { id: newPoolId.value, networkSlug },
  }).fullPath;
});
</script>

<template>
  <BalAlert type="tip" class="mb-4" :title="$t('deprecatedPool.warning.title')">
    <span>{{ $t('deprecatedPool.warning.text') }}</span>
    <BalLink v-if="newPoolId" tag="router-link" :to="poolRoute">
      incentivized pool</BalLink
    >
    <span v-else> incentivized pool</span>.
  </BalAlert>
</template>
