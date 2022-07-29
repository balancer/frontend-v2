import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { FeeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import { configService } from '@/services/config/config.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useWeb3 from '@/services/web3/useWeb3';

import { isKovan, isL2, networkId } from '../useNetwork';

/**
 * TYPES
 */
export type ProtocolRewardsQueryResponse = {
  v1?: BalanceMap;
  v2?: BalanceMap;
};

/**
 * SERVICES
 */
const feeDistributorV1 = new FeeDistributor(
  configService.network.addresses.feeDistributorDeprecated
);
const feeDistributorV2 = new FeeDistributor(
  configService.network.addresses.feeDistributor
);

/**
 * @summary Fetches claimable protocol reward balances.
 */
export default function useProtocolRewardsQuery(
  options: UseQueryOptions<ProtocolRewardsQueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3();

  /**
   * COMPUTED
   */
  const enabled = computed(
    () =>
      isWalletReady.value &&
      account.value != null &&
      !isL2.value &&
      !isKovan.value
  );

  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Claims.Protocol(networkId, account));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      const [v1, v2] = await Promise.all([
        feeDistributorV1.getClaimableBalances(account.value),
        feeDistributorV2.getClaimableBalances(account.value),
      ]);
      return { v1, v2 };
    } catch (error) {
      console.error('Failed to fetch claimable protocol balances', error);
      return {};
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<ProtocolRewardsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions
  );
}
