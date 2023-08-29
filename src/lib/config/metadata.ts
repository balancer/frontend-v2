import { POOLS } from '@/constants/pools';
import { PoolFeature, PoolMetadata } from '@/types/pools';

/**
 * Get metadata for a pool if it exists
 */
export function poolMetadata(id: string): PoolMetadata | undefined {
  return POOLS.Metadata[id.toLowerCase()];
}

/**
 * Get list of all boosted pool IDs for network
 */
export function boostedPoolIds(): string[] {
  const poolIds: string[] = [];

  for (const poolId in POOLS.Metadata) {
    if (POOLS.Metadata[poolId].features?.[PoolFeature.Boosted]) {
      poolIds.push(poolId);
    }
  }

  return poolIds;
}
