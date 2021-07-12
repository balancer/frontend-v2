import { watch } from 'vue';
import useVueWeb3 from '@/services/web3/useVueWeb3';

import useTransactions from './useTransactions';

export default function useGlobalWatchers() {
  // COMPOSABLES
  const { blockNumber } = useVueWeb3();
  const { handlePendingTransactions } = useTransactions();

  // WATCHERS
  watch(blockNumber, async () => {
    handlePendingTransactions();
  });
}
