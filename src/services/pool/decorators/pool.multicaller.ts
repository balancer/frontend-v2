import {
  InvestmentPool__factory,
  StablePool__factory,
  Vault__factory,
  WeightedPool__factory,
} from '@balancer-labs/typechain';

import {
  isStableLike,
  isTradingHaltable,
  isWeightedLike,
  removePreMintedBPT,
  isDeep,
  isComposableStableLike,
  isComposableStable,
} from '@/composables/usePool';
import ERC20_ABI from '@/lib/abi/ERC20.json';
import IERC4626 from '@/lib/abi/IERC4626.json';
import LinearPoolABI from '@/lib/abi/LinearPool.json';
import StablePhantomPoolABI from '@/lib/abi/StablePhantomPool.json';
import StaticATokenLMABI from '@/lib/abi/StaticATokenLM.json';
import { configService } from '@/services/config/config.service';
import { Multicaller } from '@/services/multicalls/multicaller';

import { Pool, RawLinearPoolData, RawOnchainPoolDataMap } from '../types';

const PoolTypeABIs = Object.values(
  Object.fromEntries(
    [
      ...WeightedPool__factory.abi,
      ...StablePool__factory.abi,
      ...InvestmentPool__factory.abi,
      ...StablePhantomPoolABI,
      ...LinearPoolABI,
      ...StaticATokenLMABI,
      ...ERC20_ABI,
      ...IERC4626,
    ].map(row => [row.name, row])
  )
);

export class PoolMulticaller {
  constructor(
    public readonly pools: Pool[],
    private readonly MulticallerClass = Multicaller,
    private readonly vaultAddress = configService.network.addresses.vault
  ) {}

  public async fetch(): Promise<RawOnchainPoolDataMap> {
    let result = <RawOnchainPoolDataMap>{};
    const multicaller = new this.MulticallerClass();

    this.pools.forEach(pool => {
      pool = removePreMintedBPT(pool);

      multicaller
        .call({
          key: `${pool.id}.totalSupply`,
          address: pool.address,
          function: 'totalSupply',
          abi: PoolTypeABIs,
        })
        .call({
          key: `${pool.id}.decimals`,
          address: pool.address,
          function: 'decimals',
          abi: PoolTypeABIs,
        })
        .call({
          key: `${pool.id}.swapFee`,
          address: pool.address,
          function: 'getSwapFeePercentage',
          abi: PoolTypeABIs,
        });

      if (isWeightedLike(pool.poolType)) {
        multicaller.call({
          key: `${pool.id}.weights`,
          address: pool.address,
          function: 'getNormalizedWeights',
          abi: PoolTypeABIs,
        });

        if (isTradingHaltable(pool.poolType)) {
          multicaller.call({
            key: `${pool.id}.swapEnabled`,
            address: pool.address,
            function: 'getSwapEnabled',
            abi: PoolTypeABIs,
          });
        }
      } else if (isStableLike(pool.poolType)) {
        multicaller.call({
          key: `${pool.id}.amp`,
          address: pool.address,
          function: 'getAmplificationParameter',
          abi: PoolTypeABIs,
        });

        if (isComposableStableLike(pool.poolType)) {
          // Overwrite totalSupply with virtualSupply for StablePhantom pools
          multicaller.call({
            key: `${pool.id}.totalSupply`,
            address: pool.address,
            function: 'getVirtualSupply',
            abi: PoolTypeABIs,
          });
          if (isComposableStable(pool.poolType)) {
            multicaller.call({
              key: `${pool.id}.totalSupply`,
              address: pool.address,
              function: 'getActualSupply',
              abi: PoolTypeABIs,
            });
          }
        }

        if (isDeep(pool)) {
          pool.tokensList.forEach((poolToken, i) => {
            multicaller
              .call({
                key: `${pool.id}.linearPools.${poolToken}.id`,
                address: poolToken,
                function: 'getPoolId',
                abi: PoolTypeABIs,
              })
              .call({
                key: `${pool.id}.linearPools.${poolToken}.priceRate`,
                address: poolToken,
                function: 'getRate',
                abi: PoolTypeABIs,
              })
              .call({
                key: `${pool.id}.tokenRates[${i}]`,
                address: pool.address,
                function: 'getTokenRate',
                abi: PoolTypeABIs,
                params: [poolToken],
              })
              .call({
                key: `${pool.id}.linearPools.${poolToken}.mainToken.address`,
                address: poolToken,
                function: 'getMainToken',
                abi: PoolTypeABIs,
              })
              .call({
                key: `${pool.id}.linearPools.${poolToken}.mainToken.index`,
                address: poolToken,
                function: 'getMainIndex',
                abi: PoolTypeABIs,
              })
              .call({
                key: `${pool.id}.linearPools.${poolToken}.wrappedToken.address`,
                address: poolToken,
                function: 'getWrappedToken',
                abi: PoolTypeABIs,
              })
              .call({
                key: `${pool.id}.linearPools.${poolToken}.wrappedToken.index`,
                address: poolToken,
                function: 'getWrappedIndex',
                abi: PoolTypeABIs,
              })
              .call({
                key: `${pool.id}.linearPools.${poolToken}.wrappedToken.rate`,
                address: poolToken,
                function: 'getWrappedTokenRate',
                abi: PoolTypeABIs,
              });
          });
        }
      }
    });

    result = await multicaller.execute();

    this.pools.forEach(pool => {
      if (isDeep(pool) && result[pool.id].linearPools) {
        const wrappedTokensMap: Record<string, string> = {};
        const linearPools = result[pool.id].linearPools || {};

        for (const address in linearPools) {
          const linearPool: RawLinearPoolData = linearPools[address];

          multicaller.call({
            key: `${pool.id}.linearPools.${address}.tokenData`,
            address: this.vaultAddress,
            function: 'getPoolTokens',
            abi: Vault__factory.abi,
            params: [linearPool.id],
          });

          wrappedTokensMap[address] = linearPool.wrappedToken.address;
        }

        Object.entries(wrappedTokensMap).forEach(([address, wrappedToken]) => {
          multicaller
            .call({
              key: `${pool.id}.linearPools.${address}.unwrappedTokenAddress`,
              address: wrappedToken,
              function: 'ATOKEN',
              abi: PoolTypeABIs,
            })
            .call({
              key: `${pool.id}.linearPools.${address}.unwrappedERC4626Address`,
              address: wrappedToken,
              function: 'asset',
              abi: PoolTypeABIs,
            })
            .call({
              key: `${pool.id}.linearPools.${address}.totalSupply`,
              address: address,
              function: 'getVirtualSupply',
              abi: PoolTypeABIs,
            });
        });
      }

      multicaller.call({
        key: `${pool.id}.poolTokens`,
        address: this.vaultAddress,
        function: 'getPoolTokens',
        abi: Vault__factory.abi,
        params: [pool.id],
      });
    });

    return await multicaller.execute(result);
  }
}
