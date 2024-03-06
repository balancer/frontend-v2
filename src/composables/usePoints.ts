import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { pick } from 'lodash';
import { poolMetadata as getPoolMetadata } from '@/lib/config/metadata';

export function usePoints(pool: Pool) {
  const poolMetadata = computed(() => getPoolMetadata(pool.id));

  function getTokenPoints(tokenAddresses: string[]) {
    return pick(configService.network.tokens.pointMultiples, tokenAddresses);
  }

  const poolPoints = computed(() => poolMetadata.value?.points || []);
  const tokenPointMultiples = computed(() =>
    getTokenPoints(pool.tokensList || [])
  );

  const hasPoints = computed(
    () =>
      poolPoints.value.length > 0 ||
      Object.keys(tokenPointMultiples.value).length > 0
  );

  return {
    poolPoints,
    tokenPointMultiples,
    hasPoints,
  };
}