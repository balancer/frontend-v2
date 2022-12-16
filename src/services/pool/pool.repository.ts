import { configService } from '@/services/config/config.service';
import { ComputedRef } from 'vue';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import {
  GraphQLArgs,
  PoolRepository as SDKPoolRepository,
  PoolsFallbackRepository,
} from '@balancer-labs/sdk';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
export default class PoolRepository {
  repository: PoolsFallbackRepository;
  queryArgs: GraphQLArgs;

  constructor(private tokens: ComputedRef<TokenInfoMap>) {
    this.repository = new PoolsFallbackRepository(this.buildProviders(), {
      timeout: 30 * 1000,
    });
    this.queryArgs = {};
  }

  public async fetch(queryArgs: GraphQLArgs): Promise<Pool> {
    this.queryArgs = queryArgs;
    const [pool] = await this.repository.fetch();
    return pool;
  }

  private initializeDecoratedAPIRepository() {
    return {
      fetch: async (): Promise<Pool[]> => {
        return balancerAPIService.pool.get(this.queryArgs);
      },
      get skip(): number {
        return 0;
      },
    };
  }

  private initializeDecoratedSubgraphRepository() {
    return {
      fetch: async (): Promise<Pool[]> => {
        const pools = await balancerSubgraphService.pools.get(this.queryArgs);

        const poolDecorator = new PoolDecorator(pools);
        const decoratedPools = await poolDecorator.decorate(
          this.tokens.value,
          true
        );

        return decoratedPools;
      },
      get skip(): number {
        return 0;
      },
    };
  }

  private buildProviders() {
    const providers: SDKPoolRepository[] = [];
    if (checkBalancerApiIsDefined()) {
      const balancerApiRepository = this.initializeDecoratedAPIRepository();
      providers.push(balancerApiRepository);
    }
    const subgraphRepository = this.initializeDecoratedSubgraphRepository();
    providers.push(subgraphRepository);

    return providers;
  }
}

function checkBalancerApiIsDefined() {
  const defined = configService.network.balancerApi;
  if (!defined)
    console.log(
      `Skipping balancer api provider in your current network (${configService.network.chainName})`
    );
  return defined;
}
