export type SupportedRawPoolTypes = LinearPoolType | 'Weighted' | 'Investment' | 'LiquidityBootstrapping' | 'Stable' | 'MetaStable' | 'ComposableStable' | 'StablePhantom' | 'Element';
type LinearPoolType = `${string}Linear`;
export type RawPool = RawBasePool | RawLinearPool | RawWeightedPool | RawStablePool | RawComposableStablePool | RawMetaStablePool;
export interface RawBasePool {
    id: SupportedRawPoolTypes | string;
    address: string;
    poolType: string;
    poolTypeVersion: number;
    swapFee: string;
    swapEnabled: boolean;
    tokens: RawPoolToken[];
    tokensList: string[];
    liquidity: string;
    totalShares: string;
}
export interface RawLinearPool extends RawBasePool {
    poolType: LinearPoolType;
    mainIndex: number;
    wrappedIndex: number;
    lowerTarget: string;
    upperTarget: string;
    tokens: RawPoolTokenWithRate[];
}
export interface RawBaseStablePool extends RawBasePool {
    amp: string;
    hasActiveAmpUpdate?: boolean;
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
    balance: string;
}
export interface RawWeightedPoolToken extends RawPoolToken {
    weight: string;
}
export interface RawPoolTokenWithRate extends RawPoolToken {
    priceRate: string;
}
export interface LoadPoolsOptions {
    block?: number;
}
export interface PoolDataProvider {
    getPools(options?: LoadPoolsOptions): Promise<{
        pools: RawPool[];
        syncedToBlockNumber?: number;
    }>;
}
export interface PoolDataEnricher {
    fetchAdditionalPoolData(pools: RawPool[], syncedToBlockNumber?: number, options?: LoadPoolsOptions): Promise<AdditionalPoolData[]>;
    enrichPoolsWithData(pools: RawPool[], additionalPoolData: AdditionalPoolData[]): RawPool[];
}
export interface AdditionalPoolData {
    id: string;
    [key: string]: any;
}
export {};
