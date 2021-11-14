import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { masterChefContractsService } from '@/beethovenx/services/farm/master-chef-contracts.service';
import { SubgraphBalancer } from '@/services/balancer/subgraph/types';

interface ProtocolData extends SubgraphBalancer {
  beetsPrice: number;
  circulatingSupply: number;
}

export default function useProtocolDataQuery(
  options: QueryObserverOptions<ProtocolData> = {}
) {
  const { appNetworkConfig } = useWeb3();

  const queryFn = async () => {
    const [beetsPool] = await balancerSubgraphService.pools.get({
      where: {
        id: appNetworkConfig.addresses.beetsUsdcReferencePricePool.toLowerCase(),
        totalShares_gt: -1 // Avoid the filtering for low liquidity pools
      }
    });

    if (!beetsPool) {
      throw new Error('Could not load beets reference price pool');
    }

    const balancerData = await balancerSubgraphService.balancers.get();
    const beetsPrice = await getBeetsPrice(
      appNetworkConfig.addresses.beetsUsdcReferencePricePool,
      appNetworkConfig.addresses.beets,
      appNetworkConfig.addresses.usdc
    );

    const circulatingSupply = await masterChefContractsService.beethovenxToken.getCirculatingSupply();

    return {
      ...balancerData,
      beetsPrice,
      circulatingSupply
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

export async function getBeetsPrice(
  poolId: string,
  beetsAddress: string,
  usdcAddress: string
) {
  const [beetsPool] = await balancerSubgraphService.pools.get({
    where: {
      id: poolId.toLowerCase(),
      totalShares_gt: -1 // Avoid the filtering for low liquidity pools
    }
  });

  const beets = beetsPool?.tokens.find(
    token => token.address.toLowerCase() === beetsAddress.toLowerCase()
  );
  const usdc = beetsPool?.tokens.find(
    token => token.address.toLowerCase() === usdcAddress.toLowerCase()
  );

  if (!beets || !usdc) {
    return 0;
  }

  return (
    ((parseFloat(beets.weight) / parseFloat(usdc.weight)) *
      parseFloat(usdc.balance)) /
    parseFloat(beets.balance)
  );
}
