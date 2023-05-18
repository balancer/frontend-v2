import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { QueryOptions, useQuery } from '@tanstack/vue-query';
import useGraphQuery, { subgraphs } from './useGraphQuery';
import useWeb3 from '@/services/web3/useWeb3';

const attrs = {
  id: true,
  localUser: {
    id: true,
  },
  remoteUser: true,
  bias: true,
  slope: true,
  dstChainId: true,
};

export interface OmniEscrowLock {
  id: string;
  localUser: {
    id: string;
  };
  remoteUser: string;
  bias: string;
  slope: string;
  dstChainId: string;
}

export interface OmniEscrowLockResponse {
  omniVotingEscrowLocks: OmniEscrowLock[];
}

export function useOmniEscrowLocksQuery(
  account: ComputedRef<string>,
  options: QueryOptions = {}
) {
  const useOmniEscrowLocksQueryEnabled = computed(() => !!account.value);
  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Gauges.OmniEscrowLocks(account.value);

  return useGraphQuery<OmniEscrowLockResponse>(
    subgraphs.gauge,
    queryKey,
    () => ({
      omniVotingEscrowLocks: {
        __args: {
          where: {
            localUser: '0x4a30c80a2c41312ce4ee79f730c8d84cad9f7b31', // account.value.toLowerCase(),
          },
        },
        ...attrs,
      },
    }),
    reactive({ enabled: useOmniEscrowLocksQueryEnabled })
  );
}
