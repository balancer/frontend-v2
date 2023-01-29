import { LoadPoolsOptions, PoolDataEnricher, RawPool } from '../types';
interface AaveReserve {
    id: string;
    underlyingAsset: string;
    liquidityRate: string;
    liquidityIndex: string;
    lastUpdateTimestamp: string;
}
export declare class AaveReserveEnricher implements PoolDataEnricher {
    private retries;
    private timeout;
    private aaveClient;
    constructor(retries?: number, timeout?: number);
    fetchAdditionalPoolData(pools: RawPool[], syncedToBlockNumber?: number, options?: LoadPoolsOptions): Promise<AaveReserve[]>;
    enrichPoolsWithData(pools: RawPool[], additionalPoolData: AaveReserve[]): RawPool[];
    private getNormalizedIncome;
    private calculateLinearInterest;
}
export {};
