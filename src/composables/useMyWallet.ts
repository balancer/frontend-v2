// Other name option: useMyWalletState, useMyWalletTokens

import { take } from 'lodash';
import { computed } from 'vue';
import useTokens from '@/composables/useTokens';
import { isSameAddress, includesAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { Address } from '@/types';
import { AnyPool } from '@/services/pool/types';
import { tokenTreeLeafs, usePool } from '@/composables/usePool';

type Props = {
  excludedTokens?: string[];
  // If pool prop is provided, Tokens are grouped into:
  // 'Pool tokens in wallet' or 'Other tokens in wallet'
  pool?: AnyPool;
  includeNativeAsset?: boolean;
};

export default function useMyWallet({
  excludedTokens = [],
  pool,
  includeNativeAsset = false,
}: Props) {
  const { appNetworkConfig, isWalletReady } = useWeb3();

  const { balances, nativeAsset } = useTokens();

  const poolRef = computed(() => pool);

  const { isWethPool, isDeepPool } = usePool(poolRef);

  function isExcludedToken(tokenAddress: Address) {
    return excludedTokens.some(excludedAddress =>
      isSameAddress(excludedAddress, tokenAddress)
    );
  }

  const tokensWithBalance = computed<string[]>(() => {
    if (!isWalletReady) return [];
    return take(
      Object.keys(balances.value).filter(tokenAddress => {
        const _includeNativeAsset = includeNativeAsset
          ? true
          : !isSameAddress(tokenAddress, appNetworkConfig.nativeAsset.address);
        return (
          Number(balances.value[tokenAddress]) > 0 &&
          _includeNativeAsset &&
          !isSameAddress(tokenAddress, appNetworkConfig.addresses.veBAL) &&
          !isExcludedToken(tokenAddress)
        );
      }),
      21
    );
  });

  const poolTokenAddresses = computed<string[]>(() => {
    if (!pool) return [];
    if (isDeepPool.value) {
      return tokenTreeLeafs(pool.tokens);
      // return getDeepPoolTokenAddresses(pool);
    }
    if (isWethPool.value) {
      return [nativeAsset.address, ...pool.tokensList];
    }
    return pool.tokensList;
  });

  const poolTokensWithBalance = computed<string[]>(() => {
    return (
      poolTokenAddresses.value.filter(poolToken =>
        includesAddress(tokensWithBalance.value, poolToken)
      ) || []
    );
  });
  const poolTokensWithoutBalance = computed<string[]>(() => {
    return (
      poolTokenAddresses.value.filter(
        poolToken => !includesAddress(tokensWithBalance.value, poolToken)
      ) || []
    );
  });
  const notPoolTokensWithBalance = computed<string[]>(() => {
    if (!poolTokenAddresses.value) return tokensWithBalance.value;
    return (
      tokensWithBalance.value.filter(
        token => !includesAddress(poolTokenAddresses.value || [], token)
      ) || []
    );
  });

  return {
    tokensWithBalance,
    poolTokensWithBalance,
    poolTokensWithoutBalance,
    notPoolTokensWithBalance,
  };
}
