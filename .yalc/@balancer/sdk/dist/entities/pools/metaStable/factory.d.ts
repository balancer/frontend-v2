import { BasePool, BasePoolFactory } from '../';
import { RawPool } from '../../../data/types';
export declare class MetaStablePoolFactory implements BasePoolFactory {
    isPoolForFactory(pool: RawPool): boolean;
    create(pool: RawPool): BasePool;
}
