import { EthereumTxType } from '@/composables/useEthereumTxType';
import { TradeInterface } from '@/store/modules/app';

export const tradeInterfaceOptions = Object.values(TradeInterface)
  .filter(v => typeof v === 'string')
  .map(option => ({
    label: option,
    value: option
  }));

export const ethereumTxTypeOptions = Object.values(EthereumTxType)
  .filter(v => typeof v === 'string')
  .map(option => ({
    label: option,
    value: option
  }));
