import { balancerSubgraphClient } from './balancer-subgraph.client';
import { RpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';
import PoolActivities from './entities/poolActivities';
import PoolSnapshots from './entities/poolSnapshots';
import { Container, Service } from 'typedi';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

@Service()
export class BalancerSubgraphService {
  pools: Pools;
  poolShares: PoolShares;
  poolActivities: PoolActivities;
  poolSnapshots: PoolSnapshots;

  constructor(
    readonly client = balancerSubgraphClient,
    readonly rpcProviderService = Container.get(RpcProviderService)
  ) {
    // Init entities
    this.pools = new Pools(this);
    this.poolShares = new PoolShares(this);
    this.poolActivities = new PoolActivities(this);
    this.poolSnapshots = new PoolSnapshots(this);
  }

  public get blockTime(): number {
    switch (NETWORK) {
      case '1':
        return 13;
      case '137':
        return 2;
      case '42161':
        // TODO: Replace this with a more realistic number once activity picks up
        return 13;
      case '42':
        // Should be ~4s but this causes subgraph to return with unindexed block error.
        return 1;
      default:
        return 13;
    }
  }
}
