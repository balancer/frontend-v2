import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';

import { bnum } from '@/lib/utils';

import QUERY_KEYS from '@/constants/queryKeys';

import {
  getPendingClaims,
  getCurrentRewardsEstimate,
  Report,
  CurrentRewardsEstimate
} from '@/services/claim';

import { Claim } from '@/types';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import { NetworkId } from '@/constants/network';

type UserClaimsQueryResponse = {
  pendingClaims: Claim[];
  pendingClaimsReports: Report;
  availableToClaim: string;
  currentRewardsEstimate: CurrentRewardsEstimate;
  totalRewards: string;
};

export default function useUserClaimsQuery(
  options: UseQueryOptions<UserClaimsQueryResponse> = {}
) {
  // COMPOSABLES
  const {
    account,
    isWalletReady,
    appNetworkConfig,
    getProvider
  } = useVueWeb3();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Claims.All(account));

  // COMPUTED
  const isQueryEnabled = computed(
    () => isWalletReady.value && account.value != null
  );

  // METHODS
  const queryFn = async () => {
    const [pendingClaims, currentRewardsEstimate] = await Promise.all([
      getPendingClaims(
        appNetworkConfig.chainId as NetworkId,
        getProvider(),
        account.value
      ),
      getCurrentRewardsEstimate(account.value)
    ]);

    const availableToClaim = pendingClaims.claims
      .map(claim => parseFloat(claim.amount))
      .reduce((total, amount) => total.plus(amount), bnum(0));

    const totalRewards =
      currentRewardsEstimate != null
        ? availableToClaim.plus(currentRewardsEstimate.rewards)
        : availableToClaim;

    return {
      pendingClaims: pendingClaims.claims,
      pendingClaimsReports: pendingClaims.reports,
      availableToClaim: availableToClaim.toString(),
      totalRewards: totalRewards.toString(),
      currentRewardsEstimate
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options
  });

  return useQuery<UserClaimsQueryResponse>(queryKey, queryFn, queryOptions);
}
