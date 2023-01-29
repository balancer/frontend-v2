import { PoolTokenPair } from '../types';
import { BasePool, Token } from '../entities';
export type PoolAddressDictionary = {
    [address: string]: BasePool;
};
export type PoolPairMap = {
    [tokenInTokenOut: string]: {
        poolPair: PoolTokenPair;
        normalizedLiquidity: bigint;
    }[];
};
export interface PathGraphEdgeLabel {
    poolId: string;
    poolAddress: string;
    normalizedLiquidity: bigint;
    poolPair: PoolTokenPair;
    isPhantomBptHop: boolean;
}
export interface PathGraphEdge extends PathGraphEdgeLabel {
    tokenIn: string;
    tokenOut: string;
}
export interface PathGraphTraversalConfig {
    maxDepth: number;
    maxNonBoostedPathDepth: number;
    maxNonBoostedHopTokensInBoostedPath: number;
    approxPathsToReturn: number;
    poolIdsToInclude?: string[];
}
export interface PathGraphEdgeData {
    pool: BasePool;
    normalizedLiquidity: bigint;
    tokenIn: Token;
    tokenOut: Token;
}
