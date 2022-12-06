import Pools from './entities/pools';

export default class BalancerAPIService {
  pools: Pools;

  constructor() {
    // Init entities
    this.pools = new Pools(this);
  }
}

export const balancerAPIService = new BalancerAPIService();
