import { LiquiditySelection } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { TradeInterface } from '@/store/modules/app';

export const tradeLiquidityOptions = Object.values(LiquiditySelection)
  .filter(v => typeof v === 'string')
  .map(option => ({
    label: option,
    value: option
  }));

export const tradeInterfaceOptions = Object.values(TradeInterface)
  .filter(v => typeof v === 'string')
  .map(option => ({
    label: option,
    value: option
  }));
