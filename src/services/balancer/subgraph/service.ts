import Client from './client';
import InfuraService from '@/services/infura/service';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';

const NETWORK = process.env.VUE_APP_NETWORK || '1';

export default class Service {
  client: Client;
  infuraService: InfuraService;
  pools: Pools;
  poolShares: PoolShares;

  constructor(client = new Client(), infuraService = new InfuraService()) {
    this.client = client;
    this.infuraService = infuraService;

    // Init entities
    this.pools = new Pools(this);
    this.poolShares = new PoolShares(this);
  }

  public get blockTime(): number {
    switch (NETWORK) {
      case '1':
        return 13;
      case '42':
        // Should be ~4s but this causes subgraph to return with unindexed block error.
        return 1;
      default:
        return 13;
    }
  }
}
