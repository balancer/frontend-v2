import { LoadPoolsOptions, PoolDataProvider, RawPool } from '../types';
export declare class SubgraphPoolProvider implements PoolDataProvider {
    private subgraphUrl;
    private retries;
    private timeout;
    private client;
    constructor(subgraphUrl: string, retries?: number, timeout?: number);
    getPools(options?: LoadPoolsOptions): Promise<{
        pools: RawPool[];
        syncedToBlockNumber: number;
    }>;
    private getPoolsQueryFragment;
}
