import { BasePool, BasePoolFactory } from './';
import { RawPool } from '../../data/types';
export declare class PoolParser {
    private readonly poolFactories;
    constructor(customPoolFactories: BasePoolFactory[]);
    parseRawPools(rawPools: RawPool[]): BasePool[];
}
