import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import BigNumber from 'bignumber.js';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

interface QueryResponse {
  totalFbeetsSupply: BigNumber;
  totalBptStaked: BigNumber;
  userBalance: BigNumber;
  userBptTokenBalance: BigNumber;
  allowance: BigNumber;
  apr: number;
}

export default function useFreshBeetsQuery() {
  const { appLoading } = useApp();
  const { isWalletReady, account } = useWeb3();
  const enabled = computed(() => !appLoading.value && isWalletReady.value);
  const queryKey = reactive(QUERY_KEYS.FBeets.all);

  const queryFn = async () => {
    const data = await governanceContractsService.fbeets.getData(account.value);
    const apr = await beethovenxService.getFbeetsApr();

    return {
      totalFbeetsSupply: new BigNumber(data.totalFbeetsSupply.toString()),
      totalBptStaked: new BigNumber(data.totalBptStaked.toString()),
      userBalance: new BigNumber(data.userBalance.toString()),
      userBptTokenBalance: new BigNumber(data.userBptTokenBalance.toString()),
      allowance: new BigNumber(data.allowance.toString()),
      apr
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
