import { StablePool } from './';
export class StablePoolFactory {
    isPoolForFactory(pool) {
        return pool.poolType === 'ComposableStable';
    }
    create(pool) {
        return StablePool.fromRawPool(pool);
    }
}
//# sourceMappingURL=factory.js.map