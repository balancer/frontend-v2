import { HumanAmount } from '../types';
export type SupportedRawPoolTypes = LinearPoolType | 'Weighted' | 'Investment' | 'LiquidityBootstrapping' | 'Stable' | 'MetaStable' | 'ComposableStable' | 'StablePhantom' | 'Element';
type LinearPoolType = `${string}Linear`;
export type RawPool = RawBasePool | RawLinearPool | RawWeightedPool | RawStablePool | RawComposableStablePool | RawMetaStablePool;
export interface RawBasePool {
    id: SupportedRawPoolTypes | string;
    address: string;
    poolType: string;
    poolTypeVersion: number;
    swapFee: HumanAmount;
    swapEnabled: boolean;
    tokens: RawPoolToken[];
    tokensList: string[];
    liquidity: HumanAmount;
    totalShares: HumanAmount;
}
export interface RawLinearPool extends RawBasePool {
    poolType: LinearPoolType;
    mainIndex: number;
    wrappedIndex: number;
    lowerTarget: HumanAmount;
    upperTarget: HumanAmount;
    tokens: RawPoolTokenWithRate[];
}
export interface RawBaseStablePool extends RawBasePool {
    amp: string;
}
export interface RawStablePool extends RawBaseStablePool {
    poolType: 'Stable';
}
export interface RawComposableStablePool extends RawBaseStablePool {
    poolType: 'ComposableStable' | 'StablePhantom';
    tokens: RawPoolTokenWithRate[];
}
export interface RawMetaStablePool extends RawBaseStablePool {
    poolType: 'MetaStable';
    tokens: RawPoolTokenWithRate[];
}
export interface RawWeightedPool extends RawBasePool {
    poolType: 'Weighted' | 'Investment' | 'LiquidityBootstrapping';
    tokens: RawWeightedPoolToken[];
    hasActiveWeightUpdate?: boolean;
}
export interface RawPoolToken {
    address: string;
    index: number;
    symbol: string;
    name: string;
    decimals: number;
    balance: HumanAmount;
}
export interface RawWeightedPoolToken extends RawPoolToken {
    weight: HumanAmount;
}
export interface RawPoolTokenWithRate extends RawPoolToken {
    priceRate: HumanAmount;
}
export interface GetPoolsResponse {
    pools: RawPool[];
    syncedToBlockNumber?: number;
    poolsWithActiveAmpUpdates?: string[];
    poolsWithActiveWeightUpdates?: string[];
}
export interface ProviderSwapOptions {
    block?: number;
    timestamp: number;
}
export interface PoolDataProvider {
    getPools(options: ProviderSwapOptions): Promise<GetPoolsResponse>;
}
export interface PoolDataEnricher {
    fetchAdditionalPoolData(data: GetPoolsResponse, options: ProviderSwapOptions): Promise<AdditionalPoolData[]>;
    enrichPoolsWithData(pools: RawPool[], additionalPoolData: AdditionalPoolData[]): RawPool[];
}
export interface AdditionalPoolData {
    id: string;
    [key: string]: any;
}
export {};
