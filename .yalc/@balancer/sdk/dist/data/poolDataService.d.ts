import { GetPoolsResponse, PoolDataEnricher, PoolDataProvider, ProviderSwapOptions, RawPool } from './types';
export declare class PoolDataService {
    private readonly providers;
    private readonly enrichers;
    private readonly rpcUrl;
    constructor(providers: PoolDataProvider[], enrichers: PoolDataEnricher[], rpcUrl: string);
    fetchEnrichedPools(blockNumber?: number): Promise<{
        rawPools: RawPool[];
        providerData: GetPoolsResponse;
    }>;
    enrichPools(data: GetPoolsResponse, providerOptions: ProviderSwapOptions): Promise<RawPool[]>;
    getTimestampForBlockNumber(blockNumber?: number): Promise<number>;
}
