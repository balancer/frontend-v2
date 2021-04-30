import Client from './client';
import InfuraService from '@/services/infura/service';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';

export default class Service {
  client: Client;
  infuraService: InfuraService;

  constructor(client = new Client(), infuraService = new InfuraService()) {
    this.client = client;
    this.infuraService = infuraService;
  }

  public get pools(): Pools {
    return new Pools(this);
  }

  public get poolShares(): PoolShares {
    return new PoolShares(this);
  }
}
