import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { FiatCurrency } from '@/constants/currency';
import { TOKENS } from '@/constants/tokens';
import { returnChecksum } from '@/lib/decorators/return-checksum.decorator';
import { bnum, isSameAddress } from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';

import { ERC20Multicaller } from '../multicalls/erc20.multicaller';
import { Pool } from '../pool/types';
import AaveSubgraphService, {
  aaveSubgraphService,
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

    const { unwrappedAave, unwrappedERC4626, linearPoolTotalSupplies } =
      await multicaller.execute();

    const mappedUnwrappedTokens = wrappedTokens?.map((address, i) => {
      return (
        unwrappedAave[i] ||
        unwrappedERC4626[i] ||
        this.addressMapIn(address)
      ).toLowerCase();
    });

    if (
      !mainTokens ||
      !wrappedTokens ||
      !mappedUnwrappedTokens ||
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
        aToken_in: mappedUnwrappedTokens,
        isActive: true,
      },
    });

    reserves.forEach(reserve => {
      const supplyAPR = bnum(reserve.supplyAPR);

      if (supplyAPR.gt(0)) {
        const tokenIndex = mappedMainTokens.findIndex(token =>
          isSameAddress(token, reserve.underlyingAsset)
        );
        // Grabs the matching wrapped which generates the yield
        const wrappedToken = wrappedTokens[tokenIndex];
        const mainToken = mainTokens[tokenIndex];
        const linearPoolAddress = pool.tokensList[tokenIndex];
        const linearPoolToken = pool.tokens.find(token =>
          isSameAddress(token.address, linearPoolAddress)
        );
        const linearPoolTotalSupply = formatUnits(
          linearPoolTotalSupplies[tokenIndex],
          18
        );

        const mainTokenPrice = prices[getAddress(mainToken)]?.[currency];

        if (mainTokenPrice && linearPoolTotalSupply) {
          const balance = wrappedTokenBalances[tokenIndex];
          const linearPoolBalance = linearPoolToken?.balance || '0';
          const linearPoolShare = bnum(linearPoolBalance).div(
            linearPoolTotalSupply
          );
          const actualBalance = bnum(balance).times(linearPoolShare);
          const value = bnum(actualBalance).times(mainTokenPrice);
          const weightedAPR = value.times(supplyAPR).div(pool.totalLiquidity);

          breakdown[wrappedToken] = weightedAPR.toString();

          total = total.plus(weightedAPR);
        }
      }
    });

    return {
      total: total.toString(),
      breakdown,
    };
  }
}

export const aaveService = new AaveService();
