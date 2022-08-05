import { EthereumTxType } from '@/composables/useEthereumTxType';

export const ethereumTxTypeOptions = Object.values(EthereumTxType)
  .filter(v => typeof v === 'string')
  .map(option => ({
    label: option,
    value: option,
  }));
