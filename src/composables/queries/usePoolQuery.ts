import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import useTokens from '@/composables/useTokens';
import QUERY_KEYS from '@/constants/queryKeys';
import { getAddress, isAddress } from '@ethersproject/address';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import {
  FullPool,
  OnchainPoolData,
  Pool
} from '@/services/balancer/subgraph/types';
import { POOLS } from '@/constants/pools';
import useApp from '../useApp';
import useUserSettings from '../useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';
import { bnum, forChange } from '@/lib/utils';
import {
  isManaged,
  isStableLike,
  isStablePhantom,
  lpTokensFor
} from '../usePool';
import { keyBy } from 'lodash';
import { configService } from '@/services/config/config.service';

export default function usePoolQuery(
  id: string,
  options: QueryObserverOptions<FullPool> = {}
) {
  /**
   * COMPOSABLES
   */
  const { getTokens, injectTokens, prices, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { account } = useWeb3();
  const { currency } = useUserSettings();

  /**
   * COMPUTED
   */
  const enabled = computed(
    () => !appLoading.value && !dynamicDataLoading.value
  );

  /**
   * METHODS
   */
  function isBlocked(pool: Pool): boolean {
    const requiresAllowlisting =
      isStableLike(pool.poolType) || isManaged(pool.poolType);

    const isOwnedByUser =
      isAddress(account.value) &&
      isAddress(pool.owner) &&
      getAddress(pool.owner) === getAddress(account.value);
    const isAllowlisted =
      POOLS.Stable.AllowList.includes(id) ||
      POOLS.Investment.AllowList.includes(id);

    //return requiresAllowlisting && !isAllowlisted && !isOwnedByUser;

    return false;
  }

  function removePreMintedBPT(pool: Pool): Pool {
    // Remove pre-minted BPT token if exits
    pool.tokensList = pool.tokensList.filter(
      address => address !== pool.address.toLowerCase()
    );

    pool.tokens = pool.tokens.filter(
      token => token.address !== pool.address.toLowerCase()
    );

    return pool;
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  function getLinearPoolAttrs(pool: Pool): Pool {
    // Fetch linear pools from subgraph
    const linearPools = pool.linearPools || [];
    const linearPoolTokensMap: Pool['linearPoolTokensMap'] = {};

    // Inject main/wrapped tokens into pool schema
    linearPools.forEach(linearPool => {
      if (!pool.wrappedTokens) pool.wrappedTokens = [];

      const index = pool.tokensList.findIndex(token => {
        if (
          token === configService.network.addresses.bbUsd &&
          configService.network.usdTokens.includes(linearPool.mainToken.address)
        ) {
          return true;
        }

        return linearPool.address.toLowerCase() === token;
      });
      const mainToken = getAddress(linearPool.mainToken.address);
      const wrappedToken = getAddress(linearPool.wrappedToken.address);

      //console.log('linear pool index', linearPool.symbol, index);
      pool.wrappedTokens[index] = wrappedToken;

      linearPoolTokensMap[mainToken] = {
        ...linearPool.mainToken,
        address: mainToken,
        priceRate: null,
        weight: ''
      };

      linearPoolTokensMap[wrappedToken] = {
        ...linearPool.wrappedToken,
        address: wrappedToken,
        weight: ''
      };
    });

    pool.linearPoolTokensMap = linearPoolTokensMap;
    pool.linearPoolToMainTokenMap = linearPools.reduce((map, linearPool) => {
      map[linearPool.address] = linearPool.mainToken.address;
      return map;
    }, {});

    return pool;
  }

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id);

  const queryFn = async () => {
    const pools = await balancerSubgraphService.pools.get();
    let pool = pools.find(pool => pool.id === id.toLowerCase());

    if (!pool) {
      throw new Error('No pool with id');
    }

    if (isBlocked(pool)) throw new Error('Pool not allowed');

    const isStablePhantomPool = isStablePhantom(pool.poolType);

    if (isStablePhantomPool) {
      pool = removePreMintedBPT(pool);
    }

    if (pool.linearPools) {
      pool = getLinearPoolAttrs(pool);
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
    /*const onchainData = await balancerContractsService.vault.getPoolData(
      id,
      pool.poolType,
      getTokens(pool.tokensList.map(address => getAddress(address)))
    );*/

    //the onchain data is now fetched by the backend, we map it into the desired format
    //here to avoid editing all of the files that currently use onchain

    const onchainData: OnchainPoolData = {
      totalSupply: pool.totalShares,
      decimals: 18,
      swapFee: pool.swapFee,
      swapEnabled: pool.swapEnabled,
      tokens: keyBy(pool.tokens, token => getAddress(token.address)),
      amp: pool.amp,
      linearPools: pool.linearPools
        ? keyBy(pool.linearPools, linearPool => getAddress(linearPool.address))
        : undefined,
      tokenRates: pool.tokenRates
    };

    const [decoratedPool] = await balancerSubgraphService.pools.decorate([
      { ...pool, onchain: onchainData }
    ]);

    let unwrappedTokens: Pool['unwrappedTokens'];

    return { onchain: onchainData, unwrappedTokens, ...decoratedPool };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
