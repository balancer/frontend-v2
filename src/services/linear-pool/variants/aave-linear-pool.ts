import { bnum } from '@/lib/utils';
import { aaveSubgraphService } from '@/services/aave/subgraph/aave-subgraph.service';

import { LinearPool } from '../types';

export class AaveLinearPool implements LinearPool {
  constructor(private subgraphService = aaveSubgraphService) {}

  public async calcBoostedAPR(
    mainToken: string,
    wrappedToken: string,
    wrappedTokenBalance: string,
    totalLiquidity: string,
    price: string
  ): Promise<string> {
    const [reserve] = await this.subgraphService.reserves.get({
      where: {
        underlyingAsset_is: mainToken,
        isActive: true
      }
    });

    const supplyAPR = bnum(reserve.supplyAPR);
    const value = bnum(wrappedTokenBalance).times(price);

    return value
      .times(supplyAPR)
      .div(totalLiquidity)
      .toString();
  }
}
