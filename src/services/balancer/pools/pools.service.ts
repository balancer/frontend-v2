import WeightedPoolService from './weighted-pool.service';

export default class PoolsService {
  weighted: WeightedPoolService;

  constructor() {
    this.weighted = new WeightedPoolService();
  }
}

export const poolsService = new PoolsService();
