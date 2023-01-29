import { WeightedPool } from './';
export class WeightedPoolFactory {
    isPoolForFactory(pool) {
        return pool.poolType === 'Weighted';
    }
    create(pool) {
        return WeightedPool.fromRawPool(pool);
    }
}
//# sourceMappingURL=factory.js.map