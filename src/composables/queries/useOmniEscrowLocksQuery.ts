import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery, { subgraphs } from './useGraphQuery';

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

export function useOmniEscrowLocksQuery(account: ComputedRef<string>) {
  const useOmniEscrowLocksQueryEnabled = computed(() => !!account.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Gauges.OmniEscrowLocks(account);

  return useGraphQuery<OmniEscrowLockResponse>(
    subgraphs.gauge,
    queryKey,
    () => ({
      omniVotingEscrowLocks: {
        __args: {
          where: {
            localUser: account.value?.toLowerCase(),
          },
        },
        ...attrs,
      },
    }),
    reactive({ enabled: useOmniEscrowLocksQueryEnabled })
  );
}
