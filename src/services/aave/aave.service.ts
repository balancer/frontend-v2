import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { FiatCurrency } from '@/constants/currency';
import { TOKENS } from '@/constants/tokens';
import { returnChecksum } from '@/lib/decorators/return-checksum.decorator';
import { bnum } from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';

import { Pool } from '../balancer/subgraph/types';
import { ERC20Multicaller } from '../multicalls/erc20.multicaller';
import AaveSubgraphService, {
  aaveSubgraphService
} from './subgraph/aave-subgraph.service';

export default class AaveService {
  subgraphService: AaveSubgraphService;

  constructor(subgraphService = aaveSubgraphService) {
    this.subgraphService = subgraphService;
  }

  @returnChecksum()
  public addressMapIn(address: string): string {
    const addressMap = TOKENS?.PriceChainMap;
    if (!addressMap) return address;
    return addressMap[address.toLowerCase()] || address;
  }

  public async calcWeightedSupplyAPRFor(
    pool: Pool,
    prices: TokenPrices,
    currency: FiatCurrency
  ) {
    const { mainTokens, wrappedTokens, linearPoolTokensMap } = pool;

    const wrappedTokenBalances = wrappedTokens?.map(
      token => linearPoolTokensMap?.[token].balance || ''
    );
    const hasAllWrappedTokenBalances =
      wrappedTokenBalances && wrappedTokenBalances.every(balance => !!balance);

    const multicaller = new ERC20Multicaller();

    wrappedTokens?.forEach((address, i) => {
      multicaller.call(`unwrappedAave[${i}]`, address, 'ATOKEN');
      multicaller.call(`unwrappedERC4626[${i}]`, address, 'asset');
      multicaller.call(
        `linearPoolTotalSupplies[${i}]`,
        pool.tokensList[i],
        'getVirtualSupply'
      );
    });

    const {
      unwrappedAave,
      unwrappedERC4626,
      linearPoolTotalSupplies
    } = await multicaller.execute();

    const unwrappedTokens = wrappedTokens?.map((address, i) => {
      return (unwrappedAave[i] || unwrappedERC4626[i] || address).toLowerCase();
    });

    if (
      !mainTokens ||
      !wrappedTokens ||
      !unwrappedTokens ||
      !hasAllWrappedTokenBalances
    )
      return { total: '0', breakdown: {} };

    let total = bnum(0);
    const breakdown: Record<string, string> = {};

    const mappedMainTokens = mainTokens?.map(address =>
      this.addressMapIn(address)
    );

    const reserves = await this.subgraphService.reserves.get({
      where: {
        underlyingAsset_in: mappedMainTokens,
        // aToken_in: unwrappedTokens,
        isActive: true
      }
    });

    reserves.forEach(reserve => {
      const supplyAPR = bnum(reserve.supplyAPR);

      if (supplyAPR.gt(0)) {
        const tokenIndex = mappedMainTokens.findIndex(
          token => token === getAddress(reserve.underlyingAsset)
        );
        // Grabs the matching wrapped which generates the yield
        const wrappedToken = wrappedTokens[tokenIndex];
        const mainToken = mainTokens[tokenIndex];
        const linearPoolAddress = pool.tokenAddresses[tokenIndex];
        const linearPoolToken = pool.tokens.find(
          token => token.address === linearPoolAddress
        );
        const linearPoolTotalSupply = formatUnits(
          linearPoolTotalSupplies[tokenIndex],
          18
        );

        if (prices[mainToken] != null && linearPoolTotalSupply) {
          const price = prices[mainToken][currency] || 0;
          const balance = wrappedTokenBalances[tokenIndex];
          const linearPoolBalance = linearPoolToken?.balance || '0';
          const linearPoolShare = bnum(linearPoolBalance).div(
            linearPoolTotalSupply
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
