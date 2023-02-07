import WeightedPoolService, { FactoryVersion } from './weighted-pool.service';
import { networkId } from '@/composables/useNetwork';

export default class PoolsService {
  weighted: WeightedPoolService;

  constructor() {
    // use the V2 factory for Gnosis Chain
    const version =
      networkId.value === 100 ? FactoryVersion.V2 : FactoryVersion.V3;
    this.weighted = new WeightedPoolService(version);
  }
}

export const poolsService = new PoolsService();
