import { ComputedRef } from 'vue';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { GraphQLArgs, PoolsFallbackRepository } from '@balancer-labs/sdk';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';

export default class PoolRepository {
  repository: PoolsFallbackRepository;
  queryArgs: GraphQLArgs;

  constructor(private tokens: ComputedRef<TokenInfoMap>) {
    const balancerApiRepository = this.initializeDecoratedAPIRepository();
    const subgraphRepository = this.initializeDecoratedSubgraphRepository();
    this.repository = new PoolsFallbackRepository(
      [balancerApiRepository, subgraphRepository],
      {
        timeout: 30 * 1000,
      }
    );
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
        const pools = await balancerAPIService.pool.get(this.queryArgs);
        if (!pools.length) throw new Error('Cannot find pool via Balancer API');
        return pools;
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
}
