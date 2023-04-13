<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import useNetwork from '@/composables/useNetwork';
import { deprecatedDetails } from '@/composables/usePoolHelpers';

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

const localeKey = computed((): string => {
  if (newPoolId.value) return 'deprecatedPool.hasNewPool';

  return 'deprecatedPool.generic';
});

const poolRoute = computed(() => {
  if (!newPoolId.value) return undefined;

  return router.resolve({
    name: 'pool',
    params: { id: newPoolId.value, networkSlug },
  }).fullPath;
});
</script>

<template>
  <BalAlert type="tip" class="mb-4" :title="$t(`${localeKey}.title`)">
    <span>{{ $t(`${localeKey}.description`) }}</span>
    &nbsp;
    <BalLink v-if="newPoolId" tag="router-link" :to="poolRoute">
      {{ $t('incentivizedPool') }}</BalLink
    >.
  </BalAlert>
</template>
