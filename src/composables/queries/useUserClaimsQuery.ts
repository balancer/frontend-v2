import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';

import { bnum } from '@/lib/utils';

import useWeb3 from '@/composables/useWeb3';

import QUERY_KEYS from '@/constants/queryKeys';

import getProvider from '@/lib/utils/provider';
import { getPendingClaims, getCurrentRewardsEstimate } from '@/services/claim';

import { Claim } from '@/types';

type UserClaimsQueryResponse = {
  pendingClaims: Claim[];
  availableToClaim: string;
  currentRewardsEstimate: string | null;
};

export default function useUserClaimsQuery(
  options: UseQueryOptions<UserClaimsQueryResponse> = {}
) {
  // COMPOSABLES
  const { account, isConnected, appNetwork } = useWeb3();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Claims.All(account));

  // COMPUTED
  const isQueryEnabled = computed(
    () => isConnected.value && account.value != null
  );

  const provider = getProvider(appNetwork.key);

  // METHODS
  const queryFn = async () => {
    const [pendingClaims, currentRewardsEstimate] = await Promise.all([
      getPendingClaims(appNetwork.id, provider, account.value),
      getCurrentRewardsEstimate(account.value)
    ]);

    const availableToClaim = pendingClaims
      .map(claim => parseFloat(claim.amount))
      .reduce((total, amount) => total.plus(amount), bnum(0))
      .toString();

    return {
      pendingClaims,
      availableToClaim,
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
