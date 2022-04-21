import { linearPoolClassMap } from './constants';
import { LinearPool } from './types';

export class LinearPoolFactory implements LinearPool {
  private linearPool: LinearPool;

  constructor(address: string) {
    const linearPoolClass = linearPoolClassMap[address];
    if (!linearPoolClass)
      throw new Error(`No linear pool class for ${address}`);

    this.linearPool = new linearPoolClass();
  }

  public async calcBoostedAPR(
    mainToken: string,
    wrappedToken: string,
    wrappedTokenBalance: string,
    totalLiquidity: string,
    price: string
  ): Promise<string> {
    return this.linearPool.calcBoostedAPR(
      mainToken,
      wrappedToken,
      wrappedTokenBalance,
      totalLiquidity,
      price
    );
  }
}
