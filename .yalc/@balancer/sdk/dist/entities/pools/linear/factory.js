import { LinearPool } from './';
export class LinearPoolFactory {
    isPoolForFactory(pool) {
        return pool.poolType.includes('Linear');
    }
    create(pool) {
        return LinearPool.fromRawPool(pool);
    }
}
//# sourceMappingURL=factory.js.map