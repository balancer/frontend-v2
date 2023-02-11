import { computed } from 'vue';

import { PoolToken } from '@/network';

import { isArbitrum, isMainnet, isPolygon } from '../useNetwork';

export function poolPathSymbolSegment(tokens: PoolToken[]) {
  return tokens.map(token => token.symbol).join('-');
}

export function useApyVisionHelpers() {
  const apyVisionNetworkName = computed(() => {
    if (isMainnet.value) {
      return 'eth';
    } else if (isPolygon.value) {
      return 'matic';
    } else if (isArbitrum.value) {
      return 'arbitrum';
    } else {
      return 'eth';
    }
  });

  return {
    apyVisionNetworkName,
    poolPathSymbolSegment,
  };
}
