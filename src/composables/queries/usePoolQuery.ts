import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import useTokens from '@/composables/useTokens';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import {
  FullPool,
  LinearPool,
  Pool,
  PoolToken
} from '@/services/balancer/subgraph/types';
import { POOLS } from '@/constants/pools';
import useApp from '../useApp';
import useUserSettings from '../useUserSettings';
import useWeb3 from '@/services/web3/useWeb3';
import { forChange } from '@/lib/utils';
import {
  lpTokensFor,
  isManaged,
  isStableLike,
  isStablePhantom
} from '../usePool';
import { getAddress, isAddress } from '@ethersproject/address';

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

    const linearPoolTokens: PoolToken[] = [];

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

      linearPoolTokens.push(
        ...linearPool.tokens
          .filter(token => token.address !== linearPool.address)
          .map(token => ({ ...token, address: getAddress(token.address) }))
      );
    });

    pool.linearPoolTokens = linearPoolTokens;

    return pool;
  }

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id);

  const queryFn = async () => {
    let [pool] = await balancerSubgraphService.pools.get({
      where: {
        id: id.toLowerCase(),
        totalShares_gt: -1 // Avoid the filtering for low liquidity pools
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
      currency.value
    );

    let unwrappedTokens: Pool['unwrappedTokens'];

    if (isStablePhantomPool && onchainData.linearPools != null) {
      unwrappedTokens = Object.entries(onchainData.linearPools).map(
        ([, linearPool]) => linearPool.unwrappedTokenAddress
      );
    }

    console.log('pool', {
      onchain: onchainData,
      unwrappedTokens,
      ...decoratedPool
    });
    return { onchain: onchainData, unwrappedTokens, ...decoratedPool };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
