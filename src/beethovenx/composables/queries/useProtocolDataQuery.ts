import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { SubgraphBalancer } from '@/services/balancer/subgraph/types';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

interface ProtocolData extends SubgraphBalancer {
  beetsPrice: number;
  circulatingSupply: number;
}

export default function useProtocolDataQuery(
  options: QueryObserverOptions<ProtocolData> = {}
) {
  const queryFn = async () => {
    const protocolData = await beethovenxService.getProtocolData();

    return {
      poolCount: parseInt(protocolData.poolCount),
      totalSwapFee: parseFloat(protocolData.totalSwapFee),
      totalSwapVolume: parseFloat(protocolData.totalSwapVolume),
      beetsPrice: parseFloat(protocolData.beetsPrice),
      circulatingSupply: parseFloat(protocolData.circulatingSupply),
      totalLiquidity: parseFloat(protocolData.totalLiquidity)
    };
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<ProtocolData>(
    QUERY_KEYS.ProtocolData.All,
    queryFn,
    queryOptions
  );
}
