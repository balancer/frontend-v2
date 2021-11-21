import { computed } from 'vue';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import useFarmUserQuery from '@/beethovenx/composables/farms/useFarmUserQuery';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string,
  amount: string
): Promise<TransactionResponse> {
  return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
}

export default function useFarmUser(farmId: string) {
  const farmUserQuery = useFarmUserQuery(farmId);

  const farmUser = computed(() => {
    return farmUserQuery.data.value;
  });

  const farmUserLoading = computed(() => {
    return farmUserQuery.isLoading.value || farmUserQuery.isIdle.value;
  });

  return {
    farmUser,
    farmUserLoading,
    farmUserRefetch: farmUserQuery.refetch
  };
}
