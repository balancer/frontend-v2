import { PoolType, SwapKind } from '../../../types';
import { Token, TokenAmount, BigintIsh } from '../../';
import { BasePool } from '../';
import { RawWeightedPool } from '../../../data/types';
declare class WeightedPoolToken extends TokenAmount {
    readonly weight: bigint;
    readonly index: number;
    constructor(token: Token, amount: BigintIsh, weight: BigintIsh, index: number);
}
export declare class WeightedPool implements BasePool {
    readonly id: string;
    readonly address: string;
    readonly poolType: PoolType;
    readonly poolTypeVersion: number;
    readonly swapFee: bigint;
    readonly tokens: WeightedPoolToken[];
    private readonly tokenMap;
    private readonly MAX_IN_RATIO;
    private readonly MAX_OUT_RATIO;
    static fromRawPool(pool: RawWeightedPool): WeightedPool;
    constructor(id: string, poolTypeVersion: number, swapFee: bigint, tokens: WeightedPoolToken[]);
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    subtractSwapFeeAmount(amount: TokenAmount): TokenAmount;
    addSwapFeeAmount(amount: TokenAmount): TokenAmount;
    private getRequiredTokenPair;
}
export {};
