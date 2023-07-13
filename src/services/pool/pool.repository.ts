import { ComputedRef } from 'vue';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { GraphQLArgs, PoolRepository as SDKPoolRepository } from '@sobal/sdk';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { isBalancerApiDefined } from '@/lib/utils/balancer/api';
import {
  getPoolsFallbackRepository,
  PoolsFallBackFactoryConstructor,
} from '@/dependencies/PoolsFallbackRepository';

export default class PoolRepository {
  repository: PoolsFallBackFactoryConstructor;
  queryArgs: GraphQLArgs;

  constructor(private tokens: ComputedRef<TokenInfoMap>) {
    const PoolsFallbackRepository = getPoolsFallbackRepository();
    this.repository = new PoolsFallbackRepository(this.buildRepositories(), {
      timeout: 30 * 1000,
    });
    this.queryArgs = {};
  }

  public async fetch(queryArgs: GraphQLArgs): Promise<Pool> {
    this.queryArgs = queryArgs;
    const [pool] = await this.repository.fetch();
    return pool as Pool;
  }

  private initializeDecoratedAPIRepository() {
    return {
      fetch: async (): Promise<Pool[]> => {
        const pool = await balancerAPIService.pool.get(this.queryArgs);
        if (!pool) throw new Error('Cannot find pool via Balancer API');

        return [pool];
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

  private buildRepositories() {
    const repositories: SDKPoolRepository[] = [];
    if (isBalancerApiDefined) {
      const balancerApiRepository = this.initializeDecoratedAPIRepository();
      repositories.push(balancerApiRepository);
    }
    const subgraphRepository = this.initializeDecoratedSubgraphRepository();
    repositories.push(subgraphRepository);

    return repositories;
  }
}
