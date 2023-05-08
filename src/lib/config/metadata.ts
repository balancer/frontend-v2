import { POOLS } from '@/constants/pools';
import { PoolMetadata } from '@/types/pools';

/**
 * Get metadata for a pool if it exists
 */
export function poolMetadata(id: string): PoolMetadata | undefined {
  return POOLS.Metadata[id.toLowerCase()];
}
