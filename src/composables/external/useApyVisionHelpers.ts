import { computed } from 'vue';

import { TokenInfo } from '@/types/TokenList';

import { isArbitrum, isMainnet, isPolygon } from '../useNetwork';

export type TitleToken = [string, Partial<TokenInfo>];
export type TitleTokens = Array<TitleToken>;

export function poolPathSymbolSegment(titleTokens: TitleTokens) {
  return titleTokens.map(titleToken => titleToken[1]?.symbol).join('-');
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
