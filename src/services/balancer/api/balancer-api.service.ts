import SinglePool from './entities/pool';
import Pools from './entities/pools';

export default class BalancerAPIService {
  pool: SinglePool;
  pools: Pools;

  constructor() {
    // Init entities
    this.pool = new SinglePool(this);
    this.pools = new Pools(this);
  }
}

export const balancerAPIService = new BalancerAPIService();
