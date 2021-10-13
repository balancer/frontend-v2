import { EthereumTxType } from '@/composables/useEthereumTxType';
import { LiquiditySelection } from '@/lib/utils/balancer/helpers/sor/sorManager';

export const tradeLiquidityOptions = Object.values(LiquiditySelection)
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
