import { getAddress } from 'ethers/lib/utils';

import { isStable } from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';

import { balancerSubgraphService } from '../balancer/subgraph/balancer-subgraph.service';
import {
  ExcludedAddresses,
  removeAddressesFromTotalLiquidity
} from '../balancer/subgraph/entities/pools/helpers';
import {
  AnyPool,
  LinearPool,
  Pool,
  PoolToken
} from '../balancer/subgraph/types';
import { TokenPrices } from '../coingecko/api/price.service';
import { AprConcern } from './concerns/apr.concern';
import LiquidityConcern from './concerns/liquidity.concern';

export default class PoolService {
  pool: AnyPool;
  liquidityConcern: LiquidityConcern;
  apr: AprConcern;

  constructor(
    pool: AnyPool,
    liquidityConcernClass = LiquidityConcern,
    aprConcernClass = AprConcern
  ) {
    this.pool = pool;
    this.liquidityConcern = new liquidityConcernClass(this);
    this.apr = new aprConcernClass(this.pool);
  }

  public calcTotalLiquidity(
    prices: TokenPrices,
    currency: FiatCurrency
  ): string {
    try {
      return this.liquidityConcern.calcTotal(prices, currency);
    } catch (error) {
      console.error('Failed to calc pool liquidity:', error);
      return '0';
    }
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  public async decorateWithLinearPoolAttrs(): Promise<AnyPool> {
    // Fetch linear pools from subgraph
    const linearPools = (await balancerSubgraphService.pools.get(
      {
        where: {
          address_in: this.pool.tokensList,
          totalShares_gt: -1 // Avoid the filtering for low liquidity pools
        }
      },
      { mainIndex: true, wrappedIndex: true }
    )) as LinearPool[];

    const linearPoolTokensMap: Pool['linearPoolTokensMap'] = {};

    // Inject main/wrapped tokens into pool schema
    linearPools.forEach(linearPool => {
      if (!this.pool.mainTokens) this.pool.mainTokens = [];
      if (!this.pool.wrappedTokens) this.pool.wrappedTokens = [];

      const index = this.pool.tokensList.indexOf(
        linearPool.address.toLowerCase()
      );

      this.pool.mainTokens[index] = getAddress(
        linearPool.tokensList[linearPool.mainIndex]
      );
      this.pool.wrappedTokens[index] = getAddress(
        linearPool.tokensList[linearPool.wrappedIndex]
      );

      linearPool.tokens
        .filter(token => token.address !== linearPool.address)
        .forEach(token => {
          const address = getAddress(token.address);

          linearPoolTokensMap[address] = {
            ...token,
            address
          };
        });
    });

    this.pool.linearPoolTokensMap = linearPoolTokensMap;
    return this.pool;
  }

  removePreMintedBPT(): AnyPool {
    const poolAddress = balancerSubgraphService.pools.addressFor(this.pool.id);
    // Remove pre-minted BPT token if exits
    this.pool.tokensList = this.pool.tokensList.filter(
      address => address !== poolAddress.toLowerCase()
    );
    return this.pool;
  }

  formatPoolTokens(): PoolToken[] {
    const tokens = this.pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(this.pool.poolType)) return tokens;

    return tokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  }

  removeExcludedAddressesFromTotalLiquidity(
    totalLiquidityString: string,
    excludedAddresses: ExcludedAddresses
  ) {
    return removeAddressesFromTotalLiquidity(
      excludedAddresses,
      this.pool,
      totalLiquidityString
    );
  }

  calcFees(pastPool: Pool | undefined): string {
    if (!pastPool) return this.pool.totalSwapFee;

    return bnum(this.pool.totalSwapFee)
      .minus(pastPool.totalSwapFee)
      .toString();
  }
}
