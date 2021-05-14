import Service from '../service';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Token } from '@/types';
import { OnchainPoolData, PoolType } from '../../subgraph/types';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

export default class Vault {
  service: Service;
  multiCaller: Multicaller;

  constructor(service) {
    this.service = service;
    this.multiCaller = new Multicaller(NETWORK, service.provider, vaultAbi);
  }

  public async getPoolData(
    id: string,
    type: PoolType,
    tokens: Token[]
  ): Promise<OnchainPoolData> {
    const poolAddress = getAddress(id.slice(0, 42));
    let result = {} as Record<any, any>;

    this.multiCaller.call('poolTokens', this.address, 'getPoolTokens', [id]);
    result = await this.multiCaller.execute(result);
    this.service.multiCaller.call('totalSupply', poolAddress, 'totalSupply');
    this.service.multiCaller.call('decimals', poolAddress, 'decimals');
    this.service.multiCaller.call(
      'swapFee',
      poolAddress,
      'getSwapFeePercentage'
    );

    if (type === 'Weighted') {
      this.service.multiCaller.call(
        'weights',
        poolAddress,
        'getNormalizedWeights',
        []
      );
    } else if (type === 'Stable') {
      this.service.multiCaller.call(
        'amp',
        poolAddress,
        'getAmplificationParameter'
      );
    }

    result = await this.service.multiCaller.execute(result);

    return this.serializePoolData(result, type, tokens);
  }

  public serializePoolData(
    data,
    type: PoolType,
    tokens: Token[]
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

  public normalizeWeights(weights, type: PoolType, tokens: Token[]) {
    if (type == 'Weighted') {
      const totalWeight = weights.reduce((a, b) => a.add(b), BigNumber.from(0));
      return weights.map(
        w =>
          ((100 / Number(formatUnits(totalWeight, 10))) *
            Number(formatUnits(w, 10))) /
          100
      );
    } else if (type === 'Stable') {
      return tokens.map(() => 100 / tokens.length);
    } else {
      return [];
    }
  }

  public get address(): string {
    return this.service.config.addresses.vault;
  }
}
