import { reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import {
  SubgraphMetadataIPFS,
  // SubgraphMetadataCID,
} from '@/services/bleu/metadata/types';
import { metadatasSubgraphService } from '@/services/bleu/metadata/metadata-subgraph.service';
import { ipfsService } from '@/services/ipfs/ipfs.service';
// import usePoolQuery from './usePoolQuery';
// import { poolsStoreService } from '@/services/pool/pools-store.service';
// import { ipfsService } from '@/services/ipfs/ipfs.service';

/**
 * TYPES
 */
type QueryOptions = UseQueryOptions<SubgraphMetadataIPFS[]>;

/**
 * @summary Fetches Pool Metadata list from subgraph
 */
export default function useMetadatasQuery(
  ids: string[],
  options: QueryOptions = {}
) {
  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Metadata.Current(ids[0]);

  const queryFn = async () => {
    const customPoolsMetadata = await metadatasSubgraphService.pools.get({
      where: {
        id_in: ids.map(id => id.toLowerCase()),
      },
    });

    if (!customPoolsMetadata) {
      return [];
    }
    const customPoolsMetadataCID = customPoolsMetadata.map(
      pool => pool.metadataCID
    );


    const IPFSList = (await Promise.all(
      customPoolsMetadataCID.map(cid =>
        ipfsService.get(cid).then(res => {
          return {
            poolId: customPoolsMetadata.find(pool => pool.metadataCID === cid)
              ?.id,
            metadata: res,
          };
        })
      )
    )) as SubgraphMetadataIPFS[];
    return IPFSList;
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    ...options,
  });

  return useQuery<SubgraphMetadataIPFS[]>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
