import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { toUnixTimestamp } from '@/composables/useTime';
import { getPreviousEpoch } from '@/composables/useVeBAL';
import { TOKENS } from '@/constants/tokens';
import FeeDistributorABI from '@/lib/abi/FeeDistributor.json';
import StablePhantomAbi from '@/lib/abi/StablePhantomPool.json';
import veBalAbi from '@/lib/abi/veBalAbi.json';
import { bnum } from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';
import { Multicaller } from '@/services/multicalls/multicaller';

export class VeBalAprCalc {
  constructor(
    private readonly config = configService,
    private readonly balAddress = getAddress(TOKENS.Addresses.BAL),
    private readonly bbAUSDAddress = getAddress(
      TOKENS.Addresses.bbaUSD as string
    )
  ) {}

  public async calc(
    totalLiquidity: string,
    totalSupply: string,
    prices: TokenPrices
  ) {
    const { balAmount, bbAUSDAmount, bbaUSDPrice, veBalCurrentSupply } =
      await this.getData();

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
        address: this.config.network.addresses.feeDistributor,
        function: 'getTokensDistributedInWeek',
        abi: FeeDistributorABI,
        params: [this.balAddress, epochBeforeLast],
      })
      .call({
        key: 'bbAUSDAmount',
        address: this.config.network.addresses.feeDistributor,
        function: 'getTokensDistributedInWeek',
        abi: FeeDistributorABI,
        params: [this.bbAUSDAddress, epochBeforeLast],
      })
      .call({
        key: 'veBalCurrentSupply',
        address: this.config.network.addresses.veBAL,
        function: 'totalSupply()',
        abi: veBalAbi,
      })
      .call({
        key: 'bbaUSDPrice',
        address: this.bbAUSDAddress,
        function: 'getRate',
        abi: StablePhantomAbi,
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
