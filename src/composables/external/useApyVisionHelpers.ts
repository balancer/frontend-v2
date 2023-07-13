import { computed } from 'vue';

import { PoolToken } from '@sobal/sdk';

import { configService } from '@/services/config/config.service';

export function poolPathSymbolSegment(tokens: PoolToken[]) {
  return tokens.map(token => token.symbol).join('-');
}

export function useApyVisionHelpers() {
  const apyVisionNetworkName = computed(() => {
    return configService.network.thirdParty.apyVision?.networkName;
  });

  return {
    apyVisionNetworkName,
    poolPathSymbolSegment,
  };
}
