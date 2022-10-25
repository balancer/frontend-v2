// Other name option: useMyWalletState, useMyWalletTokens

import { take } from 'lodash';
import { computed } from 'vue';
import useTokens from '@/composables/useTokens';
import { isSameAddress, includesAddress } from '@/lib/utils';

import useWeb3 from '@/services/web3/useWeb3';
import { Address } from '@/types';
import { AnyPool, PoolToken } from '@/services/pool/types';

import { usePool } from '@/composables/usePool';

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

  function deepPoolTokenAddressReducer(
    acc: Set<string>,
    poolToken: PoolToken
  ): Set<string> {
    if (!pool) {
      return acc;
    }
    // Exclude BPT node
    if (isSameAddress(poolToken.address, pool.address)) {
      return acc;
    }
    // If current node has children, recursively look through the nested token tree
    if (poolToken.token.pool?.tokens?.length) {
      const nestedTokenAddresses = poolToken.token.pool?.tokens.reduce<
        Set<string>
      >(deepPoolTokenAddressReducer, acc);
      return nestedTokenAddresses;
    }

    // Add the final token address to set
    const { address } = poolToken;
    return acc.add(address);
  }

  function getDeepPoolTokenAddresses(pool: AnyPool): string[] {
    const tokensSet = pool.tokens.reduce<Set<string>>(
      deepPoolTokenAddressReducer,
      new Set<string>()
    );

    return Array.from(tokensSet);
  }
  const poolTokenAddresses = computed<string[]>(() => {
    if (!pool) return [];
    if (isDeepPool.value) {
      return getDeepPoolTokenAddresses(pool);
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
