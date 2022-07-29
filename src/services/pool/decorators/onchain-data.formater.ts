import { toNormalizedWeights } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

import { isStableLike, isWeightedLike } from '@/composables/usePool';
import { TokenInfoMap } from '@/types/TokenList';

import {
  LinearPoolDataMap,
  OnchainPoolData,
  OnchainTokenDataMap,
  Pool,
  RawOnchainPoolData,
} from '../types';

/**
 * @summary Takes map of pool ids to onchain data and formats.
 */
export class OnchainDataFormater {
  constructor(
    private readonly pool: Pool,
    private readonly rawData: RawOnchainPoolData,
    private readonly tokenMeta: TokenInfoMap
  ) {}

  public format(): OnchainPoolData {
    const poolData = <OnchainPoolData>{};

    poolData.tokens = this.formatPoolTokens();

    poolData.amp = '0';
    if (this.rawData?.amp) {
      poolData.amp = this.rawData.amp.value
        .div(this.rawData.amp.precision)
        .toString();
    }

    poolData.swapEnabled = true;
    if (this.rawData.swapEnabled !== undefined) {
      poolData.swapEnabled = this.rawData.swapEnabled;
    }

    if (this.rawData?.linearPools) {
      poolData.linearPools = this.formatLinearPools();
    }

    if (this.rawData.tokenRates) {
      poolData.tokenRates = this.rawData.tokenRates.map(rate =>
        formatUnits(rate.toString(), 18)
      );
    }

    poolData.totalSupply = formatUnits(
      this.rawData.totalSupply,
      this.rawData.decimals
    );
    poolData.decimals = this.rawData.decimals;
    poolData.swapFee = formatUnits(this.rawData.swapFee, 18);

    return poolData;
  }

  private formatPoolTokens(): OnchainTokenDataMap {
    const tokens = <OnchainTokenDataMap>{};
    const weights = this.normalizeWeights();

    this.rawData.poolTokens.tokens.forEach((token, i) => {
      const tokenBalance = this.rawData.poolTokens.balances[i];
      const decimals = this.tokenMeta[token]?.decimals;
      tokens[token.toLowerCase()] = {
        decimals,
        balance: formatUnits(tokenBalance, decimals),
        weight: weights[i],
        symbol: this.tokenMeta[token]?.symbol,
        name: this.tokenMeta[token]?.name,
        logoURI: this.tokenMeta[token]?.logoURI,
      };
    });

    // Remove pre-minted BPT
    delete tokens[this.pool.address.toLowerCase()];

    return tokens;
  }

  private formatLinearPools(): LinearPoolDataMap {
    const _linearPools = <LinearPoolDataMap>{};

    for (const address in this.rawData.linearPools) {
      const {
        id,
        mainToken,
        wrappedToken,
        priceRate,
        unwrappedTokenAddress,
        unwrappedERC4626Address,
        tokenData,
        totalSupply,
      } = this.rawData.linearPools[address];

      const unwrappedAddress = unwrappedTokenAddress || unwrappedERC4626Address;

      _linearPools[address.toLowerCase()] = {
        id,
        priceRate: formatUnits(priceRate.toString(), 18),
        mainToken: {
          address: getAddress(mainToken.address),
          index: mainToken.index.toNumber(),
          balance: tokenData.balances[mainToken.index.toNumber()].toString(),
        },
        wrappedToken: {
          address: getAddress(wrappedToken.address),
          index: wrappedToken.index.toNumber(),
          balance: tokenData.balances[wrappedToken.index.toNumber()].toString(),
          priceRate: formatUnits(wrappedToken.rate, 18),
        },
        unwrappedTokenAddress: unwrappedAddress,
        totalSupply: formatUnits(totalSupply, 18),
      };
    }

    return _linearPools;
  }

  private normalizeWeights(): number[] {
    if (isWeightedLike(this.pool.poolType)) {
      // toNormalizedWeights returns weights as 18 decimal fixed point
      return toNormalizedWeights(this.rawData.weights || []).map(w =>
        Number(formatUnits(w, 18))
      );
    } else if (isStableLike(this.pool.poolType)) {
      const value = this.pool.tokensList.map(
        () => 1 / this.pool.tokensList.length
      );
      return this.rawData.poolTokens.tokens.map(() => value[0]);
    } else {
      return [];
    }
  }
}
