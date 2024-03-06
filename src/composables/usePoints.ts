import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { isString, pick, pickBy } from 'lodash';
import { poolMetadata as getPoolMetadata } from '@/lib/config/metadata';

export function usePoints(pool: Pool) {
  const poolMetadata = computed(() => getPoolMetadata(pool.id));

  function getTokenPoints(tokenAddresses: string[]): Record<string, string> {
    const poolLevelOverrides = pick(
      poolMetadata.value?.points?.tokenOverrides,
      tokenAddresses
    );

    const tokenLevelMutliples = pick(
      configService.network.tokens.pointMultiples,
      tokenAddresses
    );

    return pickBy(
      {
        ...tokenLevelMutliples,
        ...poolLevelOverrides,
      },
      isString
    );
  }

  const poolPoints = computed(() => poolMetadata.value?.points);
  const tokenPointMultiples = computed(() =>
    getTokenPoints(pool.tokensList || [])
  );

  const hasPoints = computed(
    () =>
      !!poolPoints.value || Object.keys(tokenPointMultiples.value).length > 0
  );

  return {
    poolPoints,
    tokenPointMultiples,
    hasPoints,
  };
}
