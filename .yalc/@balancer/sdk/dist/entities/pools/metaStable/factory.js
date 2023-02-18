import { MetaStablePool } from './';
export class MetaStablePoolFactory {
    isPoolForFactory(pool) {
        return pool.poolType === 'MetaStable';
    }
    create(pool) {
        return MetaStablePool.fromRawPool(pool);
    }
}
//# sourceMappingURL=factory.js.map