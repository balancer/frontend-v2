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

export function isWeighted(pool: AnyPool): boolean {
  return pool.poolType === PoolType.Weighted;
}

export function isWeth(pool: AnyPool, networkId: string): boolean {
  return pool.tokenAddresses.includes(TOKENS.AddressMap[networkId].WETH);
}

export function isStETH(pool: AnyPool): boolean {
  return pool.tokenAddresses.includes(
    getAddress(configService.network.addresses.stETH)
  );
}

export function usePool(pool: Ref<AnyPool>) {
  const { appNetworkConfig } = useWeb3();
  const isStablePool = computed(() => isStable(pool.value));
  const isWeightedPool = computed(() => isWeighted(pool.value));
  const isWethPool = computed(() => isWeth(pool.value, appNetworkConfig.key));
  const isStETHPool = computed(() => isStETH(pool.value));

  return {
    // computed
    isStablePool,
    isWeightedPool,
    isWethPool,
    isStETHPool,
    // methods
    isStable,
    isWeighted,
    isWeth
  };
}
