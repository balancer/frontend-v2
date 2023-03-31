import {
  createdAfter29March,
  filterTokensInList,
  isFx,
  isManaged,
  isStableLike,
  noInitLiquidity,
} from '@/composables/usePool';
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
  const { vettedTokenList } = useTokenLists();

  const notAllowedTokens = computed(() => {
    const vettedTokenAddresses = vettedTokenList.value.tokens.map(
      t => t.address
    );

    // Returns tokens whose addresses are not included inside vetted token list or inside allowed list
    return filterTokensInList(pool, [
      ...vettedTokenAddresses,
      ...POOLS.Weighted.AllowList,
    ]);
  });

  const nonAllowedTokensAfter29March = computed(() => {
    return createdAfter29March(pool) && notAllowedTokens.value.length > 0;
  });

  const nonAllowedSymbols = computed(() => {
    return notAllowedTokens.value.map(token => token.symbol).join(',');
  });

  const notInitialLiquidity = computed(() => {
    return noInitLiquidity(pool);
  });

  const requiresAllowListing = computed(() => {
    return doesRequireAllowListing(pool, account.value);
  });

  const disableJoinsReason = computed(() => ({
    notInitialLiquidity: notInitialLiquidity.value,
    nonVettedTokensAfter20March: nonAllowedTokensAfter29March.value,
    requiresAllowListing: requiresAllowListing.value,
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
