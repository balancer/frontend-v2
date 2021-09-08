import { Ref, computed } from 'vue';
import {
  Pool,
  DecoratedPoolWithShares,
  FullPool,
  PoolType
} from '@/services/balancer/subgraph/types';
import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';

type AnyPool = Pool | FullPool | DecoratedPoolWithShares;

export function isStable(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Stable;
}

export function isMetaStable(pool: AnyPool): boolean {
  return pool.poolType === PoolType.MetaStable;
}

export function isStableLike(pool: AnyPool): boolean {
  return isStable(pool) || isMetaStable(pool);
}

export function isWeighted(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Weighted;
}

export function isInvestment(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Investment;
}

export function isWeightedLike(pool: AnyPool): boolean {
  return isWeighted(pool) || isInvestment(pool);
}

export function isWeth(pool: AnyPool, networkId: string): boolean {
  return pool.tokenAddresses.includes(TOKENS.AddressMap[networkId].WETH);
}

export function isWstETH(pool: AnyPool): boolean {
  if (!configService.network.addresses.wstETH) return false;

  return pool.tokenAddresses.includes(
    getAddress(configService.network.addresses.wstETH)
  );
}

export function usePool(pool: Ref<AnyPool> | Ref<undefined>) {
  const { appNetworkConfig } = useWeb3();
  const isStablePool = computed(() => pool.value && isStable(pool.value));
  const isMetaStablePool = computed(
    () => pool.value && isMetaStable(pool.value)
  );
  const isStableLikePool = computed(
    () => pool.value && isStableLike(pool.value)
  );
  const isWeightedPool = computed(() => pool.value && isWeighted(pool.value));
  const isWeightedLikePool = computed(
    () => pool.value && isWeightedLike(pool.value)
  );

  const isWethPool = computed(
    () => pool.value && isWeth(pool.value, appNetworkConfig.key)
  );
  const isWstETHPool = computed(() => pool.value && isWstETH(pool.value));

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isStableLikePool,
    isWeightedPool,
    isWeightedLikePool,
    isWethPool,
    isWstETHPool,
    // methods
    isStable,
    isMetaStable,
    isStableLike,
    isWeighted,
    isWeightedLike,
    isWeth
  };
}
