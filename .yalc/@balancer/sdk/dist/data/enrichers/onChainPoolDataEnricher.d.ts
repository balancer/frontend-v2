import { LoadPoolsOptions, PoolDataEnricher, RawPool } from '../types';
import { BigNumber } from '@ethersproject/bignumber';
interface OnChainPoolData {
    id: string;
    balances: BigNumber[];
    totalSupply: BigNumber;
    swapFee?: BigNumber;
    amp?: BigNumber;
    weights?: BigNumber[];
    wrappedTokenRate?: BigNumber;
}
export declare class OnChainPoolDataEnricher implements PoolDataEnricher {
    private readonly vaultAddress;
    private readonly sorQueriesAddress;
    private readonly rpcUrl;
    private readonly sorQueriesInterface;
    constructor(vaultAddress: string, sorQueriesAddress: string, rpcUrl: string);
    fetchAdditionalPoolData(rawPools: RawPool[], syncedToBlockNumber?: number, options?: LoadPoolsOptions): Promise<OnChainPoolData[]>;
    enrichPoolsWithData(pools: RawPool[], additionalPoolData: OnChainPoolData[]): RawPool[];
    private getPoolDataQueryParams;
    private fetchOnChainPoolData;
    private isStablePoolType;
    private isLinearPoolType;
}
export {};
