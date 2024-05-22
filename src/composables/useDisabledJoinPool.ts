import {
  createdAfterTimestamp,
  filterTokensInList,
  isJoinsDisabled,
  noInitLiquidity,
  usePoolHelpers,
} from '@/composables/usePoolHelpers';
import { computed } from 'vue';
import { useTokenLists } from '@/providers/token-lists.provider';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { isTestnet } from './useNetwork';

const POOLS = configService.network.pools;

function isBlocked(poolId: string): boolean {
  return POOLS.BlockList.includes(poolId);
}

export function useDisabledJoinPool(pool: Pool) {
  const { balancerTokenList } = useTokenLists();
  const { hasNonApprovedRateProviders } = usePoolHelpers(toRef(pool));

  const notVettedTokens = computed(() => {
    const vettedTokenAddresses = balancerTokenList.value.tokens.map(
      t => t.address
    );

    // Returns tokens whose addresses are not included inside vetted token list
    return filterTokensInList(pool, vettedTokenAddresses);
  });

  const nonVettedTokensAfterTimestamp = computed(() => {
    return (
      !isTestnet.value &&
      createdAfterTimestamp(pool) &&
      notVettedTokens.value.length > 0
    );
  });

  const nonAllowedSymbols = computed(() => {
    return notVettedTokens.value.map(token => token.symbol).join(',');
  });

  const notInitialLiquidity = computed(() => {
    return noInitLiquidity(pool);
  });

  const unapprovedRateProvider = computed(() => {
    const nonApprovedRateProviderExceptions = [
      // wjAURA-WETH - https://github.com/balancer/frontend-v2/issues/4417
      '0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512',
    ];
    return (
      hasNonApprovedRateProviders.value &&
      !nonApprovedRateProviderExceptions.includes(pool.id)
    );
  });

  const disableJoinsReason = computed(() => ({
    notInitialLiquidity: notInitialLiquidity.value,
    nonVettedTokensAfterTimestamp: nonVettedTokensAfterTimestamp.value,
    hardcoded: isJoinsDisabled(pool.id),
    unapprovedRateProvider: unapprovedRateProvider.value,
    isBlocked: isBlocked(pool.id),
  }));

  const shouldDisableJoins = computed(() => {
    // Returns true if at least one of the disable reasons is true
    return Object.values(disableJoinsReason.value).some(
      reason => reason === true
    );
  });

  return {
    nonAllowedSymbols,
    disableJoinsReason,
    shouldDisableJoins,
  };
}
