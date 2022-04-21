import { LinearPool } from '../types';

export class UsdPlusLinearPool implements LinearPool {
  public async calcBoostedAPR(
    mainToken: string,
    wrappedToken: string,
    wrappedTokenBalance: string,
    totalLiquidity: string,
    price: string
  ): Promise<string> {
    return '0';
  }
}
