import Client from './client';
import InfuraService from '@/services/infura/service';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';

export default class Service {
  client: Client;
  infuraService: InfuraService;
  poolsInstance: Pools;
  poolSharesInstance: PoolShares;

  constructor(client = new Client(), infuraService = new InfuraService()) {
    this.client = client;
    this.infuraService = infuraService;

    // Init entities
    this.poolsInstance = new Pools(this);
    this.poolSharesInstance = new PoolShares(this);
  }

  public get pools(): Pools {
    return this.poolsInstance;
  }

  public get poolShares(): PoolShares {
    return this.poolSharesInstance;
  }
}
