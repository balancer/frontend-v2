import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import BStrategy from '../strategy';
import { abi } from '../abi/FlattenedTradingStrategy.json';

export const name = 'Flattened curve';

export default class Strategy extends BStrategy {
  public swapFee?: BigNumber;
  public swapFeePercent?: number;
  public amp?: BigNumber;

  async load() {
    this.swapFee = await call(this.provider, abi, [this.address, 'getSwapFee']);
    this.swapFeePercent = parseFloat(
      formatUnits(this.swapFee || BigNumber.from(0), 16)
    );
    // this.amp = await call(this.provider, abi, [this.address, 'getAmp']);
  }
}
