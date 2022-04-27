import { getAddress } from '@ethersproject/address';

import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';

import { Pool } from '../balancer/subgraph/types';
import AaveSubgraphService, {
  aaveSubgraphService
} from './subgraph/aave-subgraph.service';

export default class AaveService {
  subgraphService: AaveSubgraphService;

  constructor(subgraphService = aaveSubgraphService) {
    this.subgraphService = subgraphService;
  }

  public async calcWeightedSupplyAPRFor(
    pool: Pool,
    prices: TokenPrices,
    currency: FiatCurrency
  ) {
    const { mainTokens, wrappedTokens, onchain, linearPoolTokensMap } = pool;

    const wrappedTokenBalances = wrappedTokens?.map(
      token => linearPoolTokensMap?.[token].balance || ''
    );
    const hasAllWrappedTokenBalances =
      wrappedTokenBalances && wrappedTokenBalances.every(balance => !!balance);

    if (
      !mainTokens ||
      !wrappedTokens ||
      !onchain?.linearPools ||
      !hasAllWrappedTokenBalances
    )
      return { total: '0', breakdown: {} };

    const unwrappedTokens = Object.values(
      onchain?.linearPools
    ).map(linearPool => linearPool.unwrappedTokenAddress.toLocaleLowerCase());

    let total = bnum(0);
    const breakdown: Record<string, string> = {};

    const reserves = await this.subgraphService.reserves.get({
      where: {
        underlyingAsset_in: mainTokens,
        aToken_in: unwrappedTokens,
        isActive: true
      }
    });

    reserves.forEach(reserve => {
      const supplyAPR = bnum(reserve.supplyAPR);

      if (supplyAPR.gt(0)) {
        const tokenIndex = mainTokens.findIndex(
          token => token === getAddress(reserve.underlyingAsset)
        );
        // Grabs the matching wrapped which generates the yield
        const wrappedToken = wrappedTokens[tokenIndex];
        const mainToken = mainTokens[tokenIndex];
        const linearPoolAddress = pool.tokenAddresses[tokenIndex];
        const linearPool = pool.onchain?.linearPools?.[linearPoolAddress];

        if (prices[mainToken] != null && linearPool) {
          const price = prices[mainToken][currency] || 0;
          const balance = wrappedTokenBalances[tokenIndex];
          const linearPoolBalance =
            pool.onchain?.tokens[linearPoolAddress].balance || '0';
          const linearPoolShare = bnum(linearPoolBalance).div(
            linearPool.totalSupply
          );
          const actualBalance = bnum(balance).times(linearPoolShare);
          const value = bnum(actualBalance).times(price);
          const weightedAPR = value.times(supplyAPR).div(pool.totalLiquidity);

          breakdown[wrappedToken] = weightedAPR.toString();

          total = total.plus(weightedAPR);
        }
      }
    });

    return {
      total: total.toString(),
      breakdown
    };
  }
}

export const aaveService = new AaveService();
