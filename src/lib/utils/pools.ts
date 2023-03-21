import { PoolMetadata } from '@/types/pools';
import pools from '@/lib/config/pools';

export function metadata(poolId: string): PoolMetadata | undefined {
  return pools.Metadata[poolId];
}

export function hasIcon(poolId: string): boolean {
  return !!metadata(poolId)?.hasIcon;
}
