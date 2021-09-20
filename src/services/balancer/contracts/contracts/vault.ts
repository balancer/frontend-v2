import Service from '../balancer-contracts.service';
import { Vault__factory } from '@balancer-labs/typechain';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { OnchainPoolData, PoolType } from '../../subgraph/types';
import ConfigService from '@/services/config/config.service';
import { TokenInfoMap } from '@/types/TokenList';
import { isWeightedLike, isStableLike } from '@/composables/usePool';
import { toNormalizedWeights } from '@balancer-labs/balancer-js';

export default class Vault {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPoolData(
    id: string,
    type: PoolType,
    tokens: TokenInfoMap
  ): Promise<OnchainPoolData> {
    const poolAddress = getAddress(id.slice(0, 42));
    let result = {} as Record<any, any>;
    const vaultMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      Vault__factory.abi
    );
    const tokenMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      this.service.allABIs
    );

    vaultMultiCaller.call('poolTokens', this.address, 'getPoolTokens', [id]);
    result = await vaultMultiCaller.execute(result);
    tokenMultiCaller.call('totalSupply', poolAddress, 'totalSupply');
    tokenMultiCaller.call('decimals', poolAddress, 'decimals');
    tokenMultiCaller.call('swapFee', poolAddress, 'getSwapFeePercentage');

    if (isWeightedLike(type)) {
      tokenMultiCaller.call('weights', poolAddress, 'getNormalizedWeights', []);
    } else if (isStableLike(type)) {
      tokenMultiCaller.call('amp', poolAddress, 'getAmplificationParameter');
    }

    result = await tokenMultiCaller.execute(result);

    return this.serializePoolData(result, type, tokens);
  }

  public serializePoolData(
    data,
    type: PoolType,
    tokens: TokenInfoMap
  ): OnchainPoolData {
    const _tokens = {};
    const weights = this.normalizeWeights(data?.weights, type, tokens);

    data.poolTokens.tokens.map((token, i) => {
      const tokenBalance = data.poolTokens.balances[i];
      const tokenDecimals = tokens[token]?.decimals;
      _tokens[token] = {
        balance: formatUnits(tokenBalance, tokenDecimals),
        weight: weights[i],
        decimals: tokenDecimals,
        symbol: tokens[token]?.symbol,
        name: tokens[token]?.name,
        logoURI: tokens[token]?.logoURI
      };
    });

    let amp = '0';
    if (data?.amp) {
      amp = data.amp.value.div(data.amp.precision);
    }

    return {
      tokens: _tokens,
      totalSupply: formatUnits(data.totalSupply, data.decimals),
      decimals: data.decimals,
      swapFee: formatUnits(data.swapFee, 18),
      amp: amp
    };
  }

  public normalizeWeights(
    weights: BigNumber[],
    type: PoolType,
    tokens: TokenInfoMap
  ) {
    if (isWeightedLike(type)) {
      // toNormalizedWeights returns weights as 18 decimal fixed point
      return toNormalizedWeights(weights).map(w => formatUnits(w, 18));
    } else if (isStableLike(type)) {
      const tokensList = Object.values(tokens);
      return tokensList.map(() => 1 / tokensList.length);
    } else {
      return [];
    }
  }

  public get address(): string {
    return this.service.config.addresses.vault;
  }
}
