import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import BStrategy from '../strategy';
import { abi } from '../abi/CWPTradingStrategy.json';

export const name = 'Constant weighted product';

export default class Strategy extends BStrategy {
  public swapFee?: BigNumber;
  public swapFeePercent?: number;
  public totalTokens?: number;
  public denormWeights?: BigNumber[];
  public weights?: number[];

  async load(tokens: string[] = []) {
    const calls = [
      [this.address, 'getSwapFee'],
      [this.address, 'getTotalTokens'],
      ...tokens.map(token => [this.address, 'getWeight', [token]])
    ];
    const result = await multicall(this.network, this.provider, abi, calls);
    [[this.swapFee], [this.totalTokens]] = result;
    this.swapFeePercent = parseFloat(
      formatUnits(this.swapFee || BigNumber.from(0), 16)
    );
    const denormWeights = result
      .slice(2, tokens.length + 2)
      .map(([weight]) => weight);
    const totalWeight = denormWeights.reduce(
      (a, b) => a.add(b),
      BigNumber.from(0)
    );
    this.weights = denormWeights.map(denormWeight => {
      const weight = parseFloat(formatUnits(denormWeight, 10));
      return (100 / parseFloat(formatUnits(totalWeight, 10))) * weight;
    });
    this.denormWeights = denormWeights;
  }
}
