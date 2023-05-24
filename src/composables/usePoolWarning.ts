import { computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { configService } from '@/services/config/config.service';
import { PoolWarning } from '@/types/pools';

const issues = configService.network.pools.Issues || {};

export function usePoolWarning(poolId: Ref<string>) {
  const { t } = useI18n();

  /**
   * Array of issue keys that poolId is affected by.
   */
  const issueKeys = computed((): PoolWarning[] => {
    return Object.keys(issues)
      .map(issueKey => issues[issueKey].includes(poolId.value) && issueKey)
      .filter(issueKey => !!issueKey);
  });

  /**
   * If any issue keys, poolId is an affected pool and we should display warnings.
   */
  const isAffected = computed((): boolean => {
    return issueKeys.value.length > 0;
  });

  /**
   * Array of warnings we should display for the affected poolId.
   */
  const warnings = computed(() => {
    return issueKeys.value.map(issueKey => ({
      title: t(`poolWarnings.${issueKey}.title`),
      description: t(`poolWarnings.${issueKey}.description`),
    }));
  });

  function isAffectedBy(issueKey: PoolWarning): boolean {
    return issueKeys.value.includes(issueKey);
  }

  return {
    isAffected,
    warnings,
    isAffectedBy,
  };
}
