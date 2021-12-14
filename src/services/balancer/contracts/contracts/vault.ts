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
import { Contract } from 'ethers';
import VaultAbi from '@/lib/abi/VaultAbi.json';

export default class Vault {
  service: Service;
  instance: Contract;

  constructor(service, instanceABI = VaultAbi) {
    this.service = service;
    this.instance = new Contract(
      this.service.config.addresses.vault,
      instanceABI,
      this.service.provider
    );
  }

  public async getPoolData(
    id: string,
    type: PoolType,
    tokens: TokenInfoMap
  ): Promise<OnchainPoolData> {
    const poolAddress = getAddress(id.slice(0, 42));
    let result = <RawOnchainPoolData>{};

    const vaultMultiCaller = new Multicaller(
      this.service.config.key,
      this.service.provider,
      Vault__factory.abi
    );

    const poolMulticaller = new Multicaller(
      this.service.config.key,
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
        // Overwrite totalSupply with virtualSupply for StablePhantom pools
        poolMulticaller.call('totalSupply', poolAddress, 'getVirtualSupply');

        Object.keys(tokens).forEach((token, i) => {
          poolMulticaller.call(`linearPools.${token}.id`, token, 'getPoolId');
          poolMulticaller.call(
            `linearPools.${token}.priceRate`,
            token,
            'getRate'
          );
          poolMulticaller.call(
            `tokenRates[${i}]`,
            poolAddress,
            'getTokenRate',
            [token]
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
          poolMulticaller.call(
            `linearPools.${token}.wrappedToken.rate`,
            token,
            'getWrappedTokenRate'
          );
        });
      }
    }

    result = await poolMulticaller.execute(result);

    vaultMultiCaller.call('poolTokens', this.address, 'getPoolTokens', [id]);

    if (isStablePhantom(type) && result.linearPools) {
      const wrappedTokensMap: Record<string, string> = {};

      Object.keys(result.linearPools).forEach(address => {
        if (!result.linearPools) return;
        const linearPool: RawLinearPoolData = result.linearPools[address];

        vaultMultiCaller.call(
          `linearPools.${address}.tokenData`,
          this.address,
          'getPoolTokens',
          [linearPool.id]
        );

        wrappedTokensMap[address] = linearPool.wrappedToken.address;
      });

      Object.entries(wrappedTokensMap).forEach(([address, wrappedToken]) => {
        poolMulticaller.call(
          `linearPools.${address}.unwrappedTokenAddress`,
          wrappedToken,
          'ATOKEN'
        );
        poolMulticaller.call(
          `linearPools.${address}.totalSupply`,
          address,
          'getVirtualSupply'
        );
      });

      result = await poolMulticaller.execute(result);
    }

    result = await vaultMultiCaller.execute(result);

    return this.formatPoolData(result, type, tokens, poolAddress);
  }

  public formatPoolData(
    rawData: RawOnchainPoolData,
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
      rawData?.weights || [],
      type,
      tokens
    );

    poolData.tokens = this.formatPoolTokens(
      rawData.poolTokens,
      tokens,
      normalizedWeights,
      poolAddress
    );

    poolData.amp = '0';
    if (rawData?.amp) {
      poolData.amp = rawData.amp.value.div(rawData.amp.precision).toString();
    }

    poolData.swapEnabled = true;
    if (rawData.swapEnabled !== undefined) {
      poolData.swapEnabled = rawData.swapEnabled;
    }

    if (rawData?.linearPools) {
      poolData.linearPools = this.formatLinearPools(rawData.linearPools);
    }

    if (rawData.tokenRates) {
      poolData.tokenRates = rawData.tokenRates.map(rate =>
        formatUnits(rate.toString(), 18)
      );
    }

    poolData.totalSupply = formatUnits(rawData.totalSupply, rawData.decimals);
    poolData.decimals = rawData.decimals;
    poolData.swapFee = formatUnits(rawData.swapFee, 18);

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
      const {
        id,
        mainToken,
        wrappedToken,
        priceRate,
        unwrappedTokenAddress,
        tokenData,
        totalSupply
      } = linearPools[address];

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
          balance: tokenData.balances[wrappedToken.index.toNumber()].toString(),
          priceRate: formatUnits(wrappedToken.rate, 18)
        },
        unwrappedTokenAddress: getAddress(unwrappedTokenAddress),
        totalSupply: formatUnits(totalSupply, 18)
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
