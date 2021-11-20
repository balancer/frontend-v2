import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import { BigNumber } from 'ethers';

interface QueryResponse {
  totalSupply: BigNumber;
  userBptTokenBalance: BigNumber;
  userBalance: BigNumber;
  allowance: BigNumber;
  totalVestedAmount: BigNumber;
}

export default function useFreshBeetsQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const enabled = computed(() => !appLoading.value && isWalletReady.value);
  const queryKey = reactive(QUERY_KEYS.Dexes.GetAmountsOut);

  const queryFn = async () => {
    const data = await governanceContractsService.fbeets.getData(account.value);

    console.log('fbeets balance', data.userBalance.toString());

    return data;
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
