import { getAddress, isAddress } from '@ethersproject/address';
import { formatUnits } from 'ethers/lib/utils';
import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { bnum, forChange } from '@/lib/utils';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { FullPool, LinearPool, Pool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';

import useApp from '../useApp';
import {
  isManaged,
  isStableLike,
  isStablePhantom,
  lpTokensFor
} from '../usePool';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

export default function usePoolQuery(
  id: string,
  isEnabled: Ref<boolean> = ref(true),
  options: QueryObserverOptions<FullPool> = {}
) {
  /**
   * COMPOSABLES
   */
  const { getToken, getTokens, injectTokens, prices, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { account } = useWeb3();
  const { currency } = useUserSettings();
  const { data: subgraphGauges } = useGaugesQuery();
  const { tokens } = useTokens();

  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  /**
   * COMPUTED
   */
  const enabled = computed(
    () => !appLoading.value && !dynamicDataLoading.value && isEnabled.value
  );

  /**
   * METHODS
   */
  function isBlocked(pool: Pool): boolean {
    const requiresAllowlisting =
      isStableLike(pool.poolType) || isManaged(pool.poolType);
    const isOwnedByUser =
      isAddress(account.value) &&
      getAddress(pool.owner) === getAddress(account.value);
    const isAllowlisted =
      POOLS.Stable.AllowList.includes(id) ||
      POOLS.Investment.AllowList.includes(id);

    return requiresAllowlisting && !isAllowlisted && !isOwnedByUser;
  }

  function removePreMintedBPT(pool: Pool): Pool {
    const poolAddress = balancerSubgraphService.pools.addressFor(pool.id);
    // Remove pre-minted BPT token if exits
    pool.tokensList = pool.tokensList.filter(
      address => address !== poolAddress.toLowerCase()
    );
    return pool;
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  async function getLinearPoolAttrs(pool: Pool): Promise<Pool> {
    // Fetch linear pools from subgraph
    const linearPools = (await balancerSubgraphService.pools.get(
      {
        where: {
          address_in: pool.tokensList,
          totalShares_gt: -1 // Avoid the filtering for low liquidity pools
        }
      },
      { mainIndex: true, wrappedIndex: true }
    )) as LinearPool[];

    const linearPoolTokensMap: Pool['linearPoolTokensMap'] = {};

    // Inject main/wrapped tokens into pool schema
    linearPools.forEach(linearPool => {
      if (!pool.mainTokens) pool.mainTokens = [];
      if (!pool.wrappedTokens) pool.wrappedTokens = [];

      const index = pool.tokensList.indexOf(linearPool.address.toLowerCase());

      pool.mainTokens[index] = getAddress(
        linearPool.tokensList[linearPool.mainIndex]
      );
      pool.wrappedTokens[index] = getAddress(
        linearPool.tokensList[linearPool.wrappedIndex]
      );

      linearPool.tokens
        .filter(token => token.address !== linearPool.address)
        .forEach(token => {
          const address = getAddress(token.address);
          const tokenInfo = getToken(address);

          linearPoolTokensMap[address] = {
            ...token,
            address,
            decimals: tokenInfo.decimals
          };
        });
    });

    pool.linearPoolTokensMap = linearPoolTokensMap;

    return pool;
  }

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id, gaugeAddresses);

  const queryFn = async () => {
    let [pool] = await balancerSubgraphService.pools.get({
      where: {
        id: id.toLowerCase(),
        totalShares_gt: -1, // Avoid the filtering for low liquidity pools
        poolType_not_in: POOLS.ExcludedPoolTypes
      }
    });

    if (isBlocked(pool)) throw new Error('Pool not allowed');

    const isStablePhantomPool = isStablePhantom(pool.poolType);

    if (isStablePhantomPool) {
      pool = removePreMintedBPT(pool);
      pool = await getLinearPoolAttrs(pool);
    }

    // Inject relevant pool tokens to fetch metadata
    await injectTokens([
      ...pool.tokensList,
      ...lpTokensFor(pool),
      balancerSubgraphService.pools.addressFor(pool.id)
    ]);
    await forChange(dynamicDataLoading, false);

    // Need to fetch onchain pool data first so that calculations can be
    // performed in the decoration step.
    const poolTokenMeta = getTokens(
      pool.tokensList.map(address => getAddress(address))
    );
    const onchainData = await balancerContractsService.vault.getPoolData(
      id,
      pool.poolType,
      poolTokenMeta
    );

    const [decoratedPool] = await balancerSubgraphService.pools.decorate(
      [{ ...pool, onchain: onchainData }],
      '24h',
      prices.value,
      currency.value,
      subgraphGauges.value || [],
      tokens.value
    );

    let unwrappedTokens: Pool['unwrappedTokens'];

    if (isStablePhantomPool && onchainData.linearPools != null) {
      unwrappedTokens = Object.entries(onchainData.linearPools).map(
        ([, linearPool]) => linearPool.unwrappedTokenAddress
      );

      if (decoratedPool.linearPoolTokensMap != null) {
        let totalLiquidity = bnum(0);
        const tokensMap = getTokens(
          Object.keys(decoratedPool.linearPoolTokensMap)
        );

        Object.entries(onchainData.linearPools).forEach(([address, token]) => {
          const tokenShare = bnum(onchainData.tokens[address].balance).div(
            token.totalSupply
          );

          const mainTokenBalance = formatUnits(
            token.mainToken.balance,
            tokensMap[token.mainToken.address].decimals
          );

          const wrappedTokenBalance = formatUnits(
            token.wrappedToken.balance,
            tokensMap[token.wrappedToken.address].decimals
          );

          console.log("main token balance:, ", mainTokenBalance.toString());
          console.log("wrapped token balance:, ", wrappedTokenBalance.toString());

          const mainTokenPrice =
            prices.value[token.mainToken.address] != null
              ? prices.value[token.mainToken.address].usd
              : null;

          console.log("main token price: ", mainTokenPrice?.toString());

          if (mainTokenPrice != null) {
            const mainTokenValue = bnum(mainTokenBalance)
              .times(tokenShare)
              .times(mainTokenPrice);

            console.log("main token value: ", mainTokenValue.toString());

            const wrappedTokenValue = bnum(wrappedTokenBalance)
              .times(tokenShare)
              .times(mainTokenPrice)
              .times(token.wrappedToken.priceRate);

            console.log("wrapped token value: ", wrappedTokenValue.toString());

            const linearPoolLiquidity = mainTokenValue.plus(wrappedTokenValue);
            console.log('Linear pool total liquidity: ', linearPoolLiquidity.toString());
            totalLiquidity = bnum(totalLiquidity).plus(linearPoolLiquidity);
          }
        });

        console.log("Final total liquidity: ", totalLiquidity.toString())
        decoratedPool.totalLiquidity = totalLiquidity.toString();
      }
    }

    return { onchain: onchainData, unwrappedTokens, ...decoratedPool };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
