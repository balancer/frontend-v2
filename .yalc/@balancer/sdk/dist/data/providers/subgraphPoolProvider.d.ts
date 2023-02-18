import { GetPoolsResponse, PoolDataProvider, ProviderSwapOptions } from '../types';
interface SubgraphPoolProviderConfig {
    retries: number;
    timeout: number;
    poolTypeIn?: string[];
    poolTypeNotIn?: string[];
    poolIdIn?: string[];
    poolIdNotIn?: string[];
    loadActiveWeightUpdates?: boolean;
    loadActiveAmpUpdates?: boolean;
    addFilterToPoolQuery?: boolean;
    gqlAdditionalPoolQueryFields?: string;
}
export declare class SubgraphPoolProvider implements PoolDataProvider {
    private client;
    private readonly config;
    constructor(subgraphUrl: string, config?: Partial<SubgraphPoolProviderConfig>);
    getPools(options: ProviderSwapOptions): Promise<GetPoolsResponse>;
    private fetchDataFromSubgraph;
    private getPoolsQuery;
    private poolMatchesFilter;
}
export {};
