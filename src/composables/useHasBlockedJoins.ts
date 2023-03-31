import { createdAfter29March } from '@/composables/usePool';
import { computed } from 'vue';

import { Pool } from '@/services/pool/types';
import { flatTokenTree } from './usePool';

export function useHasBlockedJoins(pool: ComputedRef<Pool | undefined>) {
  //TODO: WE need to discover how to get this list
  const allowedVettedTokenAddresses: string[] = [];
  //return token addresses that are not in the vetted list
  const nonVettedTokens = computed(() => {
    if (!pool?.value) return [];

    const poolTokens = flatTokenTree(pool.value);
    return poolTokens.filter(
      token =>
        token.address && !allowedVettedTokenAddresses.includes(token.address)
    );
  });

  const nonVettedTokenSymbols = computed(() => {
    return nonVettedTokens.value.map(token => token.symbol).join(',');
  });

  const hasBlockedJoins = computed(() => {
    if (!pool?.value) return false;

    return createdAfter29March(pool.value) && nonVettedTokens.value.length > 0;
  });

  return {
    nonVettedTokenSymbols,
    hasBlockedJoins,
  };
}
