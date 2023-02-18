import { GetPoolsResponse, PoolDataEnricher, RawPool } from '../types';
import { BigNumber } from '@ethersproject/bignumber';
import { SwapOptions } from '../../types';
interface OnChainPoolData {
    id: string;
    balances: BigNumber[];
    totalSupply: BigNumber;
    swapFee?: BigNumber;
    amp?: BigNumber;
    weights?: BigNumber[];
    wrappedTokenRate?: BigNumber;
    scalingFactors?: BigNumber[];
}
interface OnChainPoolDataQueryConfig {
    loadTokenBalanceUpdatesAfterBlock: boolean;
    blockNumber: number;
    loadTotalSupply: boolean;
    loadSwapFees: boolean;
    loadLinearWrappedTokenRates: boolean;
    loadWeightsForPools: {
        poolIds?: string[];
        poolTypes?: string[];
    };
    loadAmpForPools: {
        poolIds?: string[];
        poolTypes?: string[];
    };
    loadScalingFactorForPools: {
        poolIds?: string[];
        poolTypes?: string[];
    };
}
export declare class OnChainPoolDataEnricher implements PoolDataEnricher {
    private readonly rpcUrl;
    private readonly sorQueriesAddress;
    private readonly sorQueriesInterface;
    private readonly config;
    constructor(rpcUrl: string, sorQueriesAddress: string, config?: Partial<OnChainPoolDataQueryConfig>);
    fetchAdditionalPoolData(data: GetPoolsResponse, options: SwapOptions): Promise<OnChainPoolData[]>;
    enrichPoolsWithData(pools: RawPool[], additionalPoolData: OnChainPoolData[]): RawPool[];
    private getPoolDataQueryParams;
    private getMergedFilterConfig;
    private fetchOnChainPoolData;
    private getPoolTokenRate;
}
export {};
