import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery from './useGraphQuery';
import useNetwork from '../useNetwork';
import config from '@/lib/config';
import { Network } from '@/lib/config/types';

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
  const { networkId } = useNetwork();

  const useOmniEscrowLocksQueryEnabled = computed(() => !!account.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Gauges.OmniEscrowLocks(networkId, account);

  return useGraphQuery<OmniEscrowLockResponse>(
    config[Network.MAINNET].subgraphs.gauge,
    queryKey,
    () => ({
      __name: 'OmniEscrowLocks',
      omniVotingEscrowLocks: {
        __args: {
          where: {
            localUser: account.value?.toLowerCase(),
          },
        },
        ...attrs,
      },
    }),
    reactive({
      enabled: useOmniEscrowLocksQueryEnabled,
      refetchOnWindowFocus: false,
    })
  );
}
