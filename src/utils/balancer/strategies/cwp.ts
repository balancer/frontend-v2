import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import BStrategy from '../strategy';
import { abi } from '../abi/CWPTradingStrategy.json';

export default class Strategy extends BStrategy {
  public name = 'Constant weighted product';
  public swapFee?: BigNumber;
  public swapFeePercent?: number;
  public totalTokens?: number;

  async load() {
    this.swapFee = await call(this.provider, abi, [this.address, 'getSwapFee']);
    this.swapFeePercent = parseFloat(
      formatUnits(this.swapFee || BigNumber.from(0), 16)
    );
    this.totalTokens = await call(this.provider, abi, [
      this.address,
      'getTotalTokens'
    ]);
  }
}
