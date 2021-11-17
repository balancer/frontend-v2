import Service from '../balancer-contracts.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import {
  LinearPoolDataMap,
  OnchainPoolData,
  OnchainTokenDataMap,
  PoolType,
  RawLinearPoolData,
  RawLinearPoolDataMap,
  RawOnchainPoolData,
  RawPoolTokens
} from '../../subgraph/types';
import ConfigService from '@/services/config/config.service';
import { TokenInfoMap } from '@/types/TokenList';
import {
  isWeightedLike,
  isStableLike,
  isTradingHaltable,
  isStablePhantom
} from '@/composables/usePool';
import { toNormalizedWeights } from '@balancer-labs/balancer-js';
import { pick } from 'lodash';
import { Vault__factory } from '@balancer-labs/typechain';

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
    let result = <RawOnchainPoolData>{};

    const vaultMultiCaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      Vault__factory.abi
    );

    const poolMulticaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      this.service.allPoolABIs
    );

    poolMulticaller.call('totalSupply', poolAddress, 'totalSupply');
    poolMulticaller.call('decimals', poolAddress, 'decimals');
    poolMulticaller.call('swapFee', poolAddress, 'getSwapFeePercentage');

    if (isWeightedLike(type)) {
      poolMulticaller.call('weights', poolAddress, 'getNormalizedWeights', []);

      if (isTradingHaltable(type)) {
        poolMulticaller.call('swapEnabled', poolAddress, 'getSwapEnabled');
      }
    } else if (isStableLike(type)) {
      poolMulticaller.call('amp', poolAddress, 'getAmplificationParameter');

      if (isStablePhantom(type)) {
        Object.keys(tokens).forEach(token => {
          poolMulticaller.call(`linearPools.${token}.id`, token, 'getPoolId');
          poolMulticaller.call(
            `linearPools.${token}.priceRate`,
            token,
            'getRate'
          );
          poolMulticaller.call(
            `linearPools.${token}.mainToken.address`,
            token,
            'getMainToken'
          );
          poolMulticaller.call(
            `linearPools.${token}.mainToken.index`,
            token,
            'getMainIndex'
          );
          poolMulticaller.call(
            `linearPools.${token}.wrappedToken.address`,
            token,
            'getWrappedToken'
          );
          poolMulticaller.call(
            `linearPools.${token}.wrappedToken.index`,
            token,
            'getWrappedIndex'
          );
        });
      }
    }

    result = await poolMulticaller.execute(result);

    vaultMultiCaller.call('poolTokens', this.address, 'getPoolTokens', [id]);

    if (isStablePhantom(type) && result.linearPools) {
      // Get pool tokens for linear pools
      Object.keys(result.linearPools).forEach(address => {
        if (!result.linearPools) return;
        const linearPool: RawLinearPoolData = result.linearPools[address];
        vaultMultiCaller.call(
          `linearPools.${address}.tokenData`,
          this.address,
          'getPoolTokens',
          [linearPool.id]
        );
      });
    }

    result = await vaultMultiCaller.execute(result);

    console.log('Raw onchain data', result);

    return this.formatPoolData(result, type, tokens, poolAddress);
  }

  public formatPoolData(
    data: RawOnchainPoolData,
    type: PoolType,
    tokens: TokenInfoMap,
    poolAddress: string
  ): OnchainPoolData {
    const poolData = <OnchainPoolData>{};

    // Filter out pre-minted BPT token if exists
    const validTokens = Object.keys(tokens).filter(
      address => address !== poolAddress
    );
    tokens = pick(tokens, validTokens);

    const normalizedWeights = this.normalizeWeights(
      data?.weights || [],
      type,
      tokens
    );

    poolData.tokens = this.formatPoolTokens(
      data.poolTokens,
      tokens,
      normalizedWeights,
      poolAddress
    );

    poolData.amp = '0';
    if (data?.amp) {
      poolData.amp = data.amp.value.div(data.amp.precision).toString();
    }

    poolData.swapEnabled = true;
    if (data.swapEnabled !== undefined) {
      poolData.swapEnabled = data.swapEnabled;
    }

    if (data?.linearPools) {
      poolData.linearPools = this.formatLinearPools(data.linearPools);
    }

    poolData.totalSupply = formatUnits(data.totalSupply, data.decimals);
    poolData.decimals = data.decimals;
    poolData.swapFee = formatUnits(data.swapFee, 18);

    console.log('onchain data:', poolData);

    return poolData;
  }

  private formatPoolTokens(
    poolTokens: RawPoolTokens,
    tokenInfo: TokenInfoMap,
    weights: number[],
    poolAddress: string
  ): OnchainTokenDataMap {
    const tokens = <OnchainTokenDataMap>{};

    poolTokens.tokens.forEach((token, i) => {
      const tokenBalance = poolTokens.balances[i];
      const decimals = tokenInfo[token]?.decimals;
      tokens[token] = {
        decimals,
        balance: formatUnits(tokenBalance, decimals),
        weight: weights[i],
        symbol: tokenInfo[token]?.symbol,
        name: tokenInfo[token]?.name,
        logoURI: tokenInfo[token]?.logoURI
      };
    });

    // Remove pre-minted BPT
    delete tokens[poolAddress];

    return tokens;
  }

  private formatLinearPools(
    linearPools: RawLinearPoolDataMap
  ): LinearPoolDataMap {
    const _linearPools = <LinearPoolDataMap>{};

    Object.keys(linearPools).forEach(address => {
      const { id, mainToken, wrappedToken, priceRate, tokenData } = linearPools[
        address
      ];

      _linearPools[address] = {
        id,
        priceRate: formatUnits(priceRate.toString(), 18),
        mainToken: {
          address: getAddress(mainToken.address),
          index: mainToken.index.toNumber(),
          balance: tokenData.balances[mainToken.index.toNumber()].toString()
        },
        wrappedToken: {
          address: getAddress(wrappedToken.address),
          index: wrappedToken.index.toNumber(),
          balance: tokenData.balances[wrappedToken.index.toNumber()].toString()
        }
      };
    });

    return _linearPools;
  }

  public normalizeWeights(
    weights: BigNumber[],
    type: PoolType,
    tokens: TokenInfoMap
  ): number[] {
    if (isWeightedLike(type)) {
      // toNormalizedWeights returns weights as 18 decimal fixed point
      return toNormalizedWeights(weights).map(w => Number(formatUnits(w, 18)));
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
