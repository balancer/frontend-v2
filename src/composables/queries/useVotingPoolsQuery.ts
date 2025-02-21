import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { getApi } from '@/dependencies/balancer-api';
import {
  GaugeControllerDecorator,
  VotingPoolWithVotes,
} from '@/services/balancer/gauges/gauge-controller.decorator';
import useWeb3 from '@/services/web3/useWeb3';
import { isTestnet } from '@/composables/useNetwork';
import { VeBalGetVotingListQuery } from '@/services/api/graphql/generated/api-types';
import { Network } from '@/lib/config/types';
import { PoolType } from '@/services/pool/types';
import { testnetVotingPools } from '@/components/contextual/pages/vebal/LMVoting/testnet-voting-pools';
import { mapApiChain, mapApiPoolType } from '@/services/api/graphql/mappers';

/**
 * TYPES
 */

export type ApiVotingPools = VeBalGetVotingListQuery['veBalGetVotingList'];
export type ApiVotingPool = ApiVotingPools[number];
export type ApiVotingGauge = ApiVotingPools[number]['gauge'];

export type VotingPool = VotingPoolWithVotes & {
  network: Network;
  poolType: PoolType;
};

type QueryOptions = UseQueryOptions<VotingPool[]>;

/**
 * @summary Fetches voting pool list from balancer api and decorates it with onchain votes data
 */
export default function useVotingPoolsQuery(
  options: UseQueryOptions<VotingPool[]> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account } = useWeb3();

  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Gauges.Voting(account);

  /**
   * QUERY FUNCTION
   */
  const queryFn = async (): Promise<VotingPool[]> => {
    try {
      let apiVotingPools: ApiVotingPools;
      if (isTestnet.value) {
        apiVotingPools = testnetVotingPools('GOERLI');
      } else {
        const api = getApi();
        const { veBalGetVotingList } = await api.VeBalGetVotingList({
          includeKilled: true,
        });
        apiVotingPools = veBalGetVotingList;
      }

      const pools = await new GaugeControllerDecorator().decorateWithVotes(
        apiVotingPools,
        account.value
      );
      const poolsWithNetwork = pools.map(pool => {
        return {
          ...pool,
          network: mapApiChain(pool.chain),
          poolType: mapApiPoolType(pool.type),
        } as VotingPool;
      });
      return poolsWithNetwork.map(v => Object.freeze(v));
    } catch (error) {
      console.error('Failed to get voting pools', error);
      return [];
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: true,
    ...options,
  });

  return useQuery<VotingPool[]>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
