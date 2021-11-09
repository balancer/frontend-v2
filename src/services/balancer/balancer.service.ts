import Pools from './entities/pools';

export default class BalancerService {
  pools: Pools;

  constructor() {
    this.pools = new Pools();
  }
}

export const balancerService = new BalancerService();
