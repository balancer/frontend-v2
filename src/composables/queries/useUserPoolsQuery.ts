import { flatten, keyBy } from 'lodash';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { bnum, forChange } from '@/lib/utils';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import PoolService from '@/services/pool/pool.service';
import { PoolWithShares } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useNetwork from '../useNetwork';
import { isComposableStableLike, lpTokensFor } from '../usePool';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

type UserPoolsQueryResponse = {
  pools: PoolWithShares[];
  totalInvestedAmount: string;
  tokens: string[];
};

export default function useUserPoolsQuery(
  options: UseQueryOptions<UserPoolsQueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const {
    injectTokens,
    prices,
    dynamicDataLoading,
    tokens: tokenMeta,
  } = useTokens();
  const { account, isWalletReady } = useWeb3();
  const { currency } = useUserSettings();
  const { networkId } = useNetwork();
  const { data: subgraphGauges } = useGaugesQuery();

  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );
  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && account.value != null);

  /**
   * QUERY PROPERTIES
   */
  const queryKey = reactive(
    QUERY_KEYS.Pools.User(networkId, account, gaugeAddresses)
  );

  async function queryFn(): Promise<UserPoolsQueryResponse> {
    const poolShares = await balancerSubgraphService.poolShares.get({
      where: {
        userAddress: account.value.toLowerCase(),
      },
    });

    const poolSharesIds = poolShares.map(poolShare => poolShare.poolId.id);
    const poolSharesMap = keyBy(poolShares, poolShare => poolShare.poolId.id);

    const pools = await balancerSubgraphService.pools.get({
      where: {
        id_in: poolSharesIds,
        poolType_not_in: POOLS.ExcludedPoolTypes,
      },
    });

    for (let i = 0; i < pools.length; i++) {
      if (isComposableStableLike(pools[i].poolType)) {
        const poolService = new PoolService(pools[i]);
        poolService.removePreMintedBPT();
        await poolService.setLinearPools();
        pools[i] = poolService.pool;
      }
    }

    const tokens = flatten(
      pools.map(pool => {
        return [...pool.tokensList, ...lpTokensFor(pool), pool.address];
      })
    );
    await injectTokens(tokens);
    await forChange(dynamicDataLoading, false);

    const poolDecorator = new PoolDecorator(pools);
    const decoratedPools = await poolDecorator.decorate(
      subgraphGauges.value || [],
      prices.value,
      currency.value,
      tokenMeta.value
    );

    const poolsWithShares = decoratedPools.map(pool => ({
      ...pool,
      shares: bnum(pool.totalLiquidity)
        .div(pool.totalShares)
        .times(poolSharesMap[pool.id].balance)
        .toString(),
      bpt: poolSharesMap[pool.id].balance,
    }));

    const totalInvestedAmount = poolsWithShares
      .map(pool => pool.shares)
      .reduce((totalShares, shares) => totalShares.plus(shares), bnum(0))
      .toString();

    return {
      pools: poolsWithShares,
      tokens,
      totalInvestedAmount,
    };
  }

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<UserPoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
