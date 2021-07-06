import Service from '../service';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { TokenMap } from '@/types';
import { OnchainPoolData, PoolType } from '../../subgraph/types';
import ConfigService from '@/services/config/config.service';

export default class Vault {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getPoolData(
    id: string,
    type: PoolType,
    tokens: TokenMap
  ): Promise<OnchainPoolData> {
    const poolAddress = getAddress(id.slice(0, 42));
    let result = {} as Record<any, any>;
    const vaultMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      vaultAbi
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

    if (type === 'Weighted') {
      tokenMultiCaller.call('weights', poolAddress, 'getNormalizedWeights', []);
    } else if (type === 'Stable') {
      tokenMultiCaller.call('amp', poolAddress, 'getAmplificationParameter');
    }

    result = await tokenMultiCaller.execute(result);

    return this.serializePoolData(result, type, tokens);
  }

  public serializePoolData(
    data,
    type: PoolType,
    tokens: TokenMap
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

    return {
      tokens: _tokens,
      totalSupply: formatUnits(data.totalSupply, data.decimals),
      decimals: data.decimals,
      swapFee: formatUnits(data.swapFee, 18),
      amp: data?.amp
    };
  }

  public normalizeWeights(
    weights: BigNumber[],
    type: PoolType,
    tokens: TokenMap
  ) {
    if (type == 'Weighted') {
      const totalWeight = weights.reduce((a, b) => a.add(b), BigNumber.from(0));
      return weights.map(
        w =>
          ((100 / Number(formatUnits(totalWeight, 10))) *
            Number(formatUnits(w, 10))) /
          100
      );
    } else if (type === 'Stable') {
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
