import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { PoolGauges } from './usePoolGaugesQuery';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { bnSum } from '@/lib/utils';
import { formatUnits } from '@ethersproject/units';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type QueryResponse = string;

/**
 * Fetches staked shares for a specific pool.
 *
 * We have to do this via the contract because the subgraph is too slow.
 * We want users to receive instant feedback that their staked balances are updated
 */
export default function usePoolStakedSharesQuery(
  poolGauges: Ref<PoolGauges | undefined>,
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * QUERY KEY
   */
  const queryKey = reactive(
    QUERY_KEYS.User.Pool.StakedShares(poolGauges, account)
  );

  /**
   * COMPUTED
   */
  const enabled = computed(
    (): boolean => !!poolGauges.value && isWalletReady.value
  );

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      if (!poolGauges?.value?.pool) return '0';

      const balancePromises = poolGauges.value.pool.gauges.map(gauge => {
        const liquidityGauge = new LiquidityGauge(gauge.id);
        return liquidityGauge.balance(account.value);
      });

      const balances = (await Promise.all(balancePromises)).map(
        b => b?.toString() || '0'
      );

      const totalBalance = bnSum(balances);

      return formatUnits(totalBalance.toString(), 18);
    } catch (error) {
      console.error('Failed to fetch staked share balance', { cause: error });
      throw error;
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
