import { Network } from '@balancer-labs/sdk';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { networkId } from './useNetwork';

const POOL_ISSUES = {
  [Network.MAINNET]: {
    issue1: [],
    issue2: [],
    bugWarning20220513: [
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x072f14b85add63488ddad88f855fda4a99d6ac9b000200000000000000000027',
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2',
      '0x9e7fd25ad9d97f1e6716fa5bb04749a4621e892d000100000000000000000039',
      '0xb6b9b165c4ac3f5233a0cf413126c72be28b468a00010000000000000000005a',
      '0x09804caea2400035b18e2173fdd10ec8b670ca09000100000000000000000038'
    ]
  },
  [Network.POLYGON]: {
    issue1: [],
    issue2: []
  },
  [Network.ARBITRUM]: {
    issue1: [],
    issue2: []
  }
};

const issues = POOL_ISSUES[networkId.value];

export function usePoolWarning(poolId: string) {
  const { t } = useI18n();

  /**
   * Array of issue keys that poolId is affected by.
   */
  const issueKeys = computed((): string[] => {
    return Object.keys(issues)
      .map(issueKey => issues[issueKey].includes(poolId) && issueKey)
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
      description: t(`poolWarnings.${issueKey}.description`)
    }));
  });

  return {
    isAffected,
    warnings
  };
}
