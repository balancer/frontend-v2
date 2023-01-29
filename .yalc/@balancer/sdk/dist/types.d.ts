import { BigNumber } from '@ethersproject/bignumber';
import { Token, BasePool, BasePoolFactory } from './entities';
import { BaseProvider } from '@ethersproject/providers';
import { PoolDataEnricher, PoolDataProvider } from './data/types';
export declare enum PoolType {
    Weighted = "Weighted",
    ComposableStable = "ComposableStable",
    MetaStable = "MetaStable",
    AaveLinear = "AaveLinear"
}
export declare enum SwapKind {
    GivenIn = 0,
    GivenOut = 1
}
export interface SwapOptions {
    block?: number;
    slippage?: BigNumber;
    funds?: FundManagement;
    deadline?: BigNumber;
}
export interface FundManagement {
    sender: string;
    fromInternalBalance: boolean;
    recipient: boolean;
    toInternalBalance: boolean;
}
export type SorOptions = {
    onchainBalances: boolean;
    minPercentForPath: number;
};
export type SorConfig = {
    chainId: number;
    provider: BaseProvider;
    options?: SorOptions;
    customPoolFactories?: BasePoolFactory[];
    poolDataProviders: PoolDataProvider | PoolDataProvider[];
    poolDataEnrichers?: PoolDataEnricher | PoolDataEnricher[];
};
export type PoolFilters = {
    topN: number;
};
export interface PoolTokenPair {
    id: string;
    pool: BasePool;
    tokenIn: Token;
    tokenOut: Token;
}
export interface SingleSwap {
    poolId: string;
    kind: SwapKind;
    assetIn: string;
    assetOut: string;
    amount: string;
    userData: string;
}
export interface BatchSwapStep {
    poolId: string;
    assetInIndex: number;
    assetOutIndex: number;
    amount: string;
    userData: string;
}
