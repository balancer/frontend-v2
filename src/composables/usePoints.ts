import { Pool } from '@/services/pool/types';
import { poolMetadata as getPoolMetadata } from '@/lib/config/metadata';
import { isPast } from 'date-fns';

export function usePoints(pool: Pool) {
  const poolMetadata = computed(() => getPoolMetadata(pool.id));

  const poolPoints = computed(() => poolMetadata.value?.points || []);

  const validPoints = computed(() =>
    poolPoints.value?.filter(point => {
      if (!point.expiryTimestamp) return true;
      return !isPast(point.expiryTimestamp);
    })
  );

  const hasPoints = computed(
    () => !!validPoints.value && validPoints.value.length > 0
  );

  return {
    poolPoints,
    hasPoints,
  };
}
