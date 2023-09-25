import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery from './useGraphQuery';
import useNetwork from '../useNetwork';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';

const attrs = {
  balance: true,
  rank: true,
};

export interface LockRankQueryResponse {
  veBalGetUser: { balance: string; rank: string };
}

export function useLockRankQuery(account: ComputedRef<string>) {
  const { networkId } = useNetwork();

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Locks.UserRank(networkId, account);

  return useGraphQuery<LockRankQueryResponse>(
    'https://test-api-v3.balancer.fi/',
    queryKey,
    () => ({
      veBalGetUser: {
        ...attrs,
      },
    }),
    reactive({
      enabled: computed(() => !!account.value),
      ...FETCH_ONCE_OPTIONS,
    }),
    false,
    { accountAddress: account.value }
  );
}
