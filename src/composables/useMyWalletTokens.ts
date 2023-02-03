import { take } from 'lodash';
import { computed } from 'vue';
import { useTokens } from '@/providers/tokens.provider';
import { isSameAddress, includesAddress, removeAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { Address } from '@/types';
import { tokenTreeNodes, usePool } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';

type Props = {
  excludedTokens?: string[];
  // If pool prop is provided, Tokens are grouped into:
  // 'Pool tokens in wallet' or 'Other tokens in wallet'
  pool?: Pool;
};

export default function useMyWalletTokens({
  excludedTokens = [],
  pool,
}: Props) {
  const { appNetworkConfig } = useWeb3();

  const {
    balances,
    balanceQueryLoading: isLoadingBalances,
    nativeAsset,
  } = useTokens();

  const poolRef = computed(() => pool);

  const { isWethPool, isDeepPool } = usePool(poolRef);

  function isExcludedToken(tokenAddress: Address) {
    return excludedTokens.some(excludedAddress =>
      isSameAddress(excludedAddress, tokenAddress)
    );
  }

  const tokensWithBalance = computed((): string[] => {
    return take(
      Object.keys(balances.value).filter(tokenAddress => {
        return (
          Number(balances.value[tokenAddress]) > 0 &&
          !isSameAddress(tokenAddress, appNetworkConfig.addresses.veBAL) &&
          !isExcludedToken(tokenAddress)
        );
      }),
      21
    );
  });

  const poolTokenAddresses = computed((): string[] => {
    if (isDeepPool.value && pool?.tokens) {
      const nodes = tokenTreeNodes(pool.tokens);

      // Remove BPT from token list
      return removeAddress(pool.address, nodes);
    }

    const tokensList = pool?.tokensList || [];

    // for WETH pools, add native asset to pool tokens
    return isWethPool.value ? [nativeAsset.address, ...tokensList] : tokensList;
  });

  const poolTokensWithBalance = computed((): string[] => {
    return tokensWithBalance.value.filter(token =>
      includesAddress(poolTokenAddresses.value, token)
    );
  });

  const poolTokensWithoutBalance = computed((): string[] => {
    return (
      poolTokenAddresses.value.filter(
        poolToken => !includesAddress(tokensWithBalance.value, poolToken)
      ) || []
    );
  });
  const notPoolTokensWithBalance = computed((): string[] => {
    if (!poolTokenAddresses.value.length) return tokensWithBalance.value;
    return (
      tokensWithBalance.value.filter(
        token => !includesAddress(poolTokenAddresses.value, token)
      ) || []
    );
  });

  return {
    isLoadingBalances,
    tokensWithBalance,
    poolTokenAddresses,
    poolTokensWithBalance,
    poolTokensWithoutBalance,
    notPoolTokensWithBalance,
  };
}
