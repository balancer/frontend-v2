import Client from './client';
import InfuraService from '@/services/infura/service';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';
import PoolEvents from './entities/poolEvents';

export default class Service {
  client: Client;
  infuraService: InfuraService;
  pools: Pools;
  poolShares: PoolShares;
  poolEvents: PoolEvents;

  constructor(client = new Client(), infuraService = new InfuraService()) {
    this.client = client;
    this.infuraService = infuraService;

    // Init entities
    this.pools = new Pools(this);
    this.poolShares = new PoolShares(this);
    this.poolEvents = new PoolEvents(this);
  }
}
