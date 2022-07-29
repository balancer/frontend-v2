import { ref } from 'vue';

import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';

export enum EthereumTxType {
  LEGACY = 'Legacy',
  EIP1559 = 'EIP1559',
}

const lsEthereumTxType = lsGet(
  LS_KEYS.App.EthereumTxType,
  EthereumTxType.EIP1559
);

// STATE
export const ethereumTxType = ref<EthereumTxType>(lsEthereumTxType);

// MUTATIONS
function setEthereumTxType(txType: EthereumTxType): void {
  ethereumTxType.value = txType;
  lsSet(LS_KEYS.App.EthereumTxType, txType);
}

// INIT
setEthereumTxType(ethereumTxType.value);

export default function useEthereumTxType() {
  return {
    ethereumTxType,
    setEthereumTxType,
  };
}
