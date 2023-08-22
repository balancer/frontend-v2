import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery from './useGraphQuery';
import useWeb3 from '@/services/web3/useWeb3';
import config from '@/lib/config';
import { Network } from '@/lib/config/types';

export interface VotingEscrowLock {
  id: string;
  slope: string;
  bias: string;
  timestamp: number;
}

export interface VotingEscrowLockResponse {
  votingEscrowLocks: VotingEscrowLock[];
}

const attrs = {
  id: true,
  bias: true,
  slope: true,
  timestamp: true,
};

export function useVotingEscrowLocksQuery(
  networkId: Network,
  user: ComputedRef<string | undefined>
) {
  const { account } = useWeb3();

  const votingEscrowLocksQueryEnabled = computed(() => {
    if (!account.value) {
      return false;
    }

    if (networkId === Network.MAINNET) {
      return true;
    }

    // we need remote user for l2s
    return !!user.value;
  });

  return useGraphQuery<VotingEscrowLockResponse>(
    config[networkId].subgraphs.gauge,
    QUERY_KEYS.Gauges.VotingEscrowLocksByNetworkId(networkId, account, user),
    () => ({
      __name: 'VotingEscrowLocks',
      votingEscrowLocks: {
        __args: {
          where: {
            user: user.value?.toLowerCase(),
          },
        },
        ...attrs,
      },
    }),
    reactive({
      enabled: votingEscrowLocksQueryEnabled,
      refetchOnWindowFocus: false,
    })
  );
}
