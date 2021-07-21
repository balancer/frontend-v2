import {
  BalancesProviderPayload,
  BalancesProviderSymbol
} from '@/providers/balances.provider';
import { inject } from 'vue';

// THE CONTENTS OF THIS WILL BE REPLACED/ALTERED WITH THE REGISTRY REFACTOR
export default function useAccountBalances() {
  const {
    balances,
    hasBalance,
    error,
    isLoading,
    isIdle,
    isError,
    isFetching,
    refetchBalances
  } = inject(BalancesProviderSymbol) as BalancesProviderPayload;
  return {
    balances,
    hasBalance,
    error,
    isLoading,
    isIdle,
    isError,
    isFetching,
    refetchBalances
  };
}
