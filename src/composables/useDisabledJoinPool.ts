import {
  createdAfterTimestamp,
  filterTokensInList,
  isFx,
  isJoinsDisabled,
  isManaged,
  isStableLike,
  isWeighted,
  noInitLiquidity,
  usePoolHelpers,
} from '@/composables/usePoolHelpers';
import { computed } from 'vue';

import { isSameAddress } from '@/lib/utils';
import { useTokenLists } from '@/providers/token-lists.provider';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { isAddress } from '@ethersproject/address';
import { isTestnet } from './useNetwork';

const POOLS = configService.network.pools;

function doesRequireAllowListing(pool: Pool, account: string): boolean {
  const requiresAllowlisting =
    (isStableLike(pool.poolType) && !isFx(pool.poolType)) ||
    isManaged(pool.poolType);
  const isOwnedByUser =
    pool.owner && isAddress(account) && isSameAddress(pool.owner, account);
  const isAllowlisted =
    POOLS.Stable.AllowList.includes(pool.id) ||
    POOLS.Investment.AllowList.includes(pool.id);
  return (
    !isTestnet.value && requiresAllowlisting && !isAllowlisted && !isOwnedByUser
  );
}

export function useDisabledJoinPool(pool: Pool) {
  const { account } = useWeb3();
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

  const nonAllowedWeightedPoolAfterTimestamp = computed(() => {
    return (
      !isTestnet.value &&
      isWeighted(pool.poolType) &&
      createdAfterTimestamp(pool) &&
      !POOLS.Weighted.AllowList.includes(pool.id)
    );
  });

  const nonAllowedSymbols = computed(() => {
    return notVettedTokens.value.map(token => token.symbol).join(',');
  });

  const notInitialLiquidity = computed(() => {
    return noInitLiquidity(pool);
  });

  const requiresAllowListing = computed(() => {
    return doesRequireAllowListing(pool, account.value);
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
    requiresAllowListing: requiresAllowListing.value,
    nonVettedTokensAfterTimestamp: nonVettedTokensAfterTimestamp.value,
    nonAllowedWeightedPoolAfterTimestamp:
      nonAllowedWeightedPoolAfterTimestamp.value,
    hardcoded: isJoinsDisabled(pool.id),
    unapprovedRateProvider: unapprovedRateProvider.value,
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
