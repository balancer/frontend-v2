import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery from './useGraphQuery';
import useNetwork from '../useNetwork';
import config, { Network } from '@/lib/config';

const attrs = {
  id: true,
  bias: true,
  slope: true,
  timestamp: true,
  lockedBalance: true,
  user: {
    id: true,
  },
};

export interface LockHolderData {
  lockedBalance: string;
  user: {
    id: string;
  };
}

export interface LockLeaderQueryResponse {
  votingEscrowLocks: LockHolderData[];
}

export function useLockLeaderQuery() {
  const { networkId } = useNetwork();

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Locks.LeaderBoard(networkId);

  return useGraphQuery<LockLeaderQueryResponse>(
    config[Network.MAINNET].subgraphs.gauge,
    queryKey,
    () => ({
      __name: 'LockingLeaderboard',
      votingEscrowLocks: {
        __args: {
          first: 200,
          orderBy: 'lockedBalance',
          orderDirection: 'desc',
        },
        ...attrs,
      },
    }),
    reactive({
      refetchOnWindowFocus: false,
    })
  );
}
