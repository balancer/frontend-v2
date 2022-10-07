import { Network } from '@balancer-labs/sdk';
import { computed, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { networkId } from './useNetwork';

const POOL_ISSUES = {
  [Network.KOVAN]: {},
  [Network.GOERLI]: {},
  [Network.MAINNET]: {
    poolOwnerVulnWarningGovernanceMigrate: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
    ],
    poolOwnerVulnWarningGovernance: [
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e',
    ],
    poolOwnerVulnWarningEcosystem: [
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a',
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2',
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af',
    ],
  },
  [Network.POLYGON]: {
    poolOwnerVulnWarningGovernanceMigrate: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
      '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4',
    ],
    poolOwnerVulnWarningGovernance: [
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e',
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b',
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b',
      '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455',
    ],
    poolOwnerVulnWarningEcosystemMigrate: [
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
    ],
    poolOwnerVulnWarningEcosystem: [
      '0xb4670d1389c758e4380c4211bcbc85342688b9c50002000000000000000003d8',
    ],
  },
  [Network.ARBITRUM]: {
    poolOwnerVulnWarningGovernance: [
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
    ],
    poolOwnerVulnWarningEcosystem: [
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
    ],
  },
};

const issues = POOL_ISSUES[networkId.value];

export function usePoolWarning(poolId: Ref<string>) {
  const { t } = useI18n();

  /**
   * Array of issue keys that poolId is affected by.
   */
  const issueKeys = computed((): string[] => {
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

  return {
    isAffected,
    warnings,
  };
}
