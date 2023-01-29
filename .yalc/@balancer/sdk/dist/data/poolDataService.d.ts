import { LoadPoolsOptions, PoolDataEnricher, PoolDataProvider, RawPool } from './types';
export declare class PoolDataService {
    private readonly providers;
    private readonly enrichers;
    constructor(providers: PoolDataProvider[], enrichers: PoolDataEnricher[]);
    getEnrichedPools(options?: LoadPoolsOptions): Promise<RawPool[]>;
}
