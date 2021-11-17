import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import { BigNumber } from 'ethers';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';

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
    const totalSupply = await governanceContractsService.fbeets.getTotalFreshBeetsSupply();
    const userBptTokenBalance = await governanceContractsService.fbeets.bptBalanceOf(
      account.value
    );
    const userBalance = await governanceContractsService.fbeets.fBeetsBalanceOf(
      account.value
    );
    const allowance = await erc20ContractService.erc20.allowance(
      governanceContractsService.fbeets.vestingTokenAddress,
      account.value,
      governanceContractsService.fbeets.fbeetsAddress
    );
    const totalVestedAmount = await governanceContractsService.fbeets.getTotalVestedTokenAmount();

    return {
      totalSupply,
      userBptTokenBalance,
      userBalance,
      allowance,
      totalVestedAmount
    };
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
