import { configService } from '@/services/config/config.service';
import { BalancerSDK, Network, SubgraphPoolBase } from '@balancer-labs/sdk';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { getAddress } from '@ethersproject/address';

export const balancer = new BalancerSDK({
  network: {
    chainId: configService.network.chainId as Network,
    addresses: {
      contracts: {
        vault: configService.network.addresses.vault,
        multicall: configService.network.addresses.multicall
      },
      tokens: {
        wrappedNativeAsset: configService.network.addresses.weth
      }
    },
    urls: {
      subgraph: configService.network.poolsUrlV2
    },
    pools: {
      staBal3Pool: {
        id:
          '0x5ddb92a5340fd0ead3987d3661afcd6104c3b757000000000000000000000187',
        address: '0x5ddb92a5340fd0ead3987d3661afcd6104c3b757'
      }
    }
  },
  rpcUrl: configService.network.rpc,
  sor: {
    tokenPriceService: {
      getNativeAssetPriceInToken: async (tokenAddress: string) => {
        try {
          const tokenPrices = beethovenxService.getCachedTokenPrices();
          const nativeAssetPrice =
            tokenPrices[configService.network.addresses.weth]?.usd || 0;
          const tokenPrice = tokenPrices[getAddress(tokenAddress)]?.usd || 1;

          return `${nativeAssetPrice / tokenPrice}`;
        } catch {
          return '0';
        }
      }
    },
    poolDataService: {
      getPools: async () => {
        const pools = (await balancerSubgraphService.pools.get()) as SubgraphPoolBase[];

        return pools;
      }
    }
  }
});
