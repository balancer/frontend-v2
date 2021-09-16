import { Ref, computed } from 'vue';
import { PoolType, Poolish } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';

export function isStable(pool: Poolish): boolean {
  return pool.poolType === PoolType.Stable;
}

export function isMetaStable(pool: Poolish): boolean {
  return pool.poolType === PoolType.MetaStable;
}

export function isStableLike(pool: Poolish): boolean {
  return isStable(pool) || isMetaStable(pool);
}

export function isWeighted(pool: Poolish): boolean {
  return pool.poolType === PoolType.Weighted;
}

export function isInvestment(pool: Poolish): boolean {
  return pool.poolType === PoolType.Investment;
}

export function isWeightedLike(pool: Poolish): boolean {
  return isWeighted(pool) || isInvestment(pool);
}

export function isWeth(pool: Poolish): boolean {
  return pool.tokenAddresses.includes(configService.network.addresses.weth);
}

export function isWstETH(pool: Poolish): boolean {
  if (!configService.network.addresses.wstETH) return false;

  return pool.tokenAddresses.includes(
    getAddress(configService.network.addresses.wstETH)
  );
}

export function usePool(pool: Ref<Poolish> | Ref<undefined>) {
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

  const isWethPool = computed(() => pool.value && isWeth(pool.value));
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
