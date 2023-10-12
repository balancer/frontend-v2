<script setup lang="ts">
import { isMigratablePool } from '@/composables/usePoolHelpers';
import { usePoolWarning } from '@/composables/usePoolWarning';
import { Pool } from '@/services/pool/types';
import { PoolWarning } from '@/types/pools';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

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
const poolId = computed(() => props.pool.id);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { isAffectedBy } = usePoolWarning(poolId);

/**
 * COMPUTED
 */
const warningLabel = computed((): string => {
  if (isMigratablePool(props.pool)) {
    return t('deprecatedPool.tooltip');
  }

  if (isAffectedBy(PoolWarning.PoolProtocolFeeVulnWarning)) {
    return t(`poolWarnings.${PoolWarning.PoolProtocolFeeVulnWarning}.tooltip`);
  }

  if (isAffectedBy(PoolWarning.CspPoolVulnWarning)) {
    return t(`poolWarnings.${PoolWarning.CspPoolVulnWarning}.tooltip`);
  }

  return '';
});
</script>
<template>
  <BalTooltip
    v-if="warningLabel"
    class="mb-1 ml-2 text-red-500"
    name="alert-circle"
    filled
    size="md"
  >
    <template #activator>
      <BalIcon class="mt-1" name="alert-triangle" size="md" />
    </template>

    <div class="text-sm text-left">
      {{ warningLabel }}
    </div>
  </BalTooltip>
</template>
