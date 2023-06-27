import { reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { SubgraphMetadata } from '@/services/bleu/metadata/types';
import { metadataSubgraphService } from '@/services/bleu/metadata/metadata-subgraph.service';
import usePoolQuery from './usePoolQuery';
import { poolsStoreService } from '@/services/pool/pools-store.service';

/**
 * TYPES
 */
type QueryOptions = UseQueryOptions<SubgraphMetadata>;

/**
 * @summary Fetches Pool Metadata list from subgraph
 */
export default function useMetadataQuery(
  id: string,
  options: QueryOptions = {}
) {
  const storedPool = poolsStoreService.findPool(id);

  /**
   * QUERY DEPENDENCIES
   */
  const poolQuery = usePoolQuery(id);

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id || !!storedPool);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Metadata.Current(id);

  const queryFn = async () => {
    if (!pool.value && !storedPool) throw new Error('No pool');

    return await metadataSubgraphService.pool.get({
      id: id.toLowerCase(),
    });
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<SubgraphMetadata>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
