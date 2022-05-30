import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { toUnixTimestamp } from '@/composables/useTime';
import { getPreviousEpoch } from '@/composables/useVeBAL';
import { TOKENS } from '@/constants/tokens';
import FeeDistributorABI from '@/lib/abi/FeeDistributor.json';
import StablePhantomAbi from '@/lib/abi/StablePhantomPool.json';
import veBalAbi from '@/lib/abi/veBalAbi.json';
import { bnum } from '@/lib/utils';
import { bbAUSDToken } from '@/services/balancer/contracts/contracts/bb-a-usd-token';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';
import { Multicaller } from '@/services/multicalls/multicaller';

export class VeBalAprCalc {
  constructor(
    private readonly balAddress = getAddress(TOKENS.Addresses.BAL),
    private readonly bbAUSDAddress = getAddress(
      TOKENS.Addresses.bbaUSD as string
    ),
    private readonly veBalAddress = configService.network.addresses.veBAL,
    private readonly _feeDistributor = feeDistributor,
    private readonly _bbAUSDToken = bbAUSDToken
  ) {}

  public async calc(
    totalLiquidity: string,
    totalSupply: string,
    prices: TokenPrices
  ) {
    const {
      balAmount,
      bbAUSDAmount,
      bbaUSDPrice,
      veBalCurrentSupply
    } = await this.getData();

    const aggregateWeeklyRevenue = this.calcAggregateWeeklyRevenue(
      balAmount,
      bbAUSDAmount,
      bbaUSDPrice,
      prices
    );

    const bptPrice = bnum(totalLiquidity).div(totalSupply);

    return aggregateWeeklyRevenue
      .times(52)
      .div(bptPrice.times(veBalCurrentSupply))
      .toString();
  }

  private async getData(): Promise<{
    balAmount: string;
    bbAUSDAmount: string;
    bbaUSDPrice: string;
    veBalCurrentSupply: string;
  }> {
    const epochBeforeLast = toUnixTimestamp(getPreviousEpoch(1).getTime());
    const multicaller = new Multicaller();

    multicaller
      .call({
        key: 'balAmount',
        address: this._feeDistributor.address,
        function: 'getTokensDistributedInWeek',
        abi: FeeDistributorABI,
        params: [this.balAddress, epochBeforeLast]
      })
      .call({
        key: 'bbAUSDAmount',
        address: this._feeDistributor.address,
        function: 'getTokensDistributedInWeek',
        abi: FeeDistributorABI,
        params: [this.bbAUSDAddress, epochBeforeLast]
      })
      .call({
        key: 'veBalCurrentSupply',
        address: this.veBalAddress,
        function: 'totalSupply()',
        abi: veBalAbi
      })
      .call({
        key: 'bbaUSDPrice',
        address: this.bbAUSDAddress,
        function: 'getRate',
        abi: StablePhantomAbi
      });

    const result = await multicaller.execute();

    for (const key in result) {
      result[key] = formatUnits(result[key], 18);
    }

    return result;
  }

  private calcAggregateWeeklyRevenue(
    balAmount: string,
    bbAUSDAmount: string,
    bbaUSDPrice: string,
    prices: TokenPrices
  ) {
    const balPrice = prices[this.balAddress];

    const balValue = bnum(balAmount).times(balPrice.usd);
    const bbaUSDValue = bnum(bbAUSDAmount).times(bbaUSDPrice);

    return balValue.plus(bbaUSDValue);
  }
}
