import PoolsService from './pools/pools.service';

export default class BalancerService {
  pools: PoolsService;

  constructor() {
    this.pools = new PoolsService();
  }
}

export const balancerService = new BalancerService();
