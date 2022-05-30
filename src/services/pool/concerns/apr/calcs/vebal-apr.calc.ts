import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { toUnixTimestamp } from '@/composables/useTime';
import { getPreviousEpoch } from '@/composables/useVeBAL';
import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import { bbAUSDToken } from '@/services/balancer/contracts/contracts/bb-a-usd-token';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import { TokenPrices } from '@/services/coingecko/api/price.service';

export class VeBalAprCalc {
  constructor(
    private readonly balAddress = getAddress(TOKENS.Addresses.BAL),
    private readonly bbAUSDAddress = getAddress(
      TOKENS.Addresses.bbaUSD as string
    ),
    private readonly _feeDistributor = feeDistributor,
    private readonly _bbAUSDToken = bbAUSDToken
  ) {}

  public async calc(
    totalLiquidity: string,
    totalSupply: string,
    prices: TokenPrices
  ) {
    const { balAmount, bbAUSDAmount, veBalSupply } = await this.getEpochData();

    const aggregateWeeklyRevenue = await this.calcAggregateWeeklyRevenue(
      balAmount,
      bbAUSDAmount,
      prices
    );

    const bptPrice = bnum(totalLiquidity).div(totalSupply);

    return aggregateWeeklyRevenue
      .times(52)
      .div(bptPrice.times(veBalSupply))
      .toString();
  }

  private async getEpochData(): Promise<{
    balAmount: string;
    bbAUSDAmount: string;
    veBalSupply: string;
  }> {
    const epochBeforeLast = toUnixTimestamp(getPreviousEpoch(1).getTime());
    const multicaller = this._feeDistributor.getMulticaller();

    multicaller
      .call(
        'balAmount',
        this._feeDistributor.address,
        'getTokensDistributedInWeek',
        [this.balAddress, epochBeforeLast]
      )
      .call(
        'bbAUSDAmount',
        this._feeDistributor.address,
        'getTokensDistributedInWeek',
        [this.bbAUSDAddress, epochBeforeLast]
      )
      .call(
        'veBalSupply',
        this._feeDistributor.address,
        'getTotalSupplyAtTimestamp',
        [epochBeforeLast]
      );

    const result = await multicaller.execute();

    for (const key in result) {
      result[key] = formatUnits(result[key], 18);
    }

    return result;
  }

  private async calcAggregateWeeklyRevenue(
    balAmount: string,
    bbAUSDAmount: string,
    prices: TokenPrices
  ) {
    const balPrice = prices[this.balAddress];
    const bbaUSDPrice = bnum(await this._bbAUSDToken.getRate()).toNumber();

    const balValue = bnum(balAmount).times(balPrice.usd);
    const bbaUSDValue = bnum(bbAUSDAmount).times(bbaUSDPrice);

    return balValue.plus(bbaUSDValue);
  }
}
