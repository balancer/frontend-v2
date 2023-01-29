import { PoolType, SwapKind } from '../../../types';
import { Token, TokenAmount, BigintIsh } from '../../';
import { BasePool } from '../';
import { RawWeightedPool } from '../../../data/types';
export declare class WeightedPoolToken extends TokenAmount {
    readonly weight: bigint;
    constructor(token: Token, amount: BigintIsh, weight: BigintIsh);
}
export declare class WeightedPool implements BasePool {
    id: string;
    address: string;
    poolType: PoolType;
    poolTypeVersion: number;
    swapFee: bigint;
    tokens: WeightedPoolToken[];
    MAX_IN_RATIO: bigint;
    MAX_OUT_RATIO: bigint;
    static fromRawPool(pool: RawWeightedPool): WeightedPool;
    constructor(id: string, poolTypeVersion: number, swapFee: bigint, tokens: WeightedPoolToken[]);
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    subtractSwapFeeAmount(amount: TokenAmount): TokenAmount;
    addSwapFeeAmount(amount: TokenAmount): TokenAmount;
}
