import { createdAfter29March } from '@/composables/usePool';
import { computed } from 'vue';

import { Pool } from '@/services/pool/types';
import { flatTokenTree } from './usePool';

export function useHasBlockedJoins(pool: Pool) {
  //TODO: WE need to discover how to get this list
  const allowedVettedTokenAddresses: string[] = [];
  //return token addresses that are not in the vetted list
  const nonVettedTokens = computed(() => {
    const poolTokens = flatTokenTree(pool);
    return poolTokens.filter(
      token =>
        token.address && !allowedVettedTokenAddresses.includes(token.address)
    );
  });

  const nonVettedTokenSymbols = computed(() => {
    return nonVettedTokens.value.map(token => token.symbol).join(',');
  });

  const hasBlockedJoins = computed(() => {
    return createdAfter29March(pool) && nonVettedTokens.value.length > 0;
  });

  return {
    nonVettedTokenSymbols,
    hasBlockedJoins,
  };
}
