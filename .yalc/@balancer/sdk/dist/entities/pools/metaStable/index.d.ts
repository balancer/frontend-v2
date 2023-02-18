import { PoolType, SwapKind } from '../../../types';
import { BigintIsh, Token, TokenAmount } from '../../';
import { BasePool } from '../';
import { RawMetaStablePool } from '../../../data/types';
declare class StablePoolToken extends TokenAmount {
    readonly rate: bigint;
    readonly scale18: bigint;
    readonly index: number;
    constructor(token: Token, amount: BigintIsh, rate: BigintIsh, index: number);
}
export declare class MetaStablePool implements BasePool {
    readonly id: string;
    readonly address: string;
    readonly poolType: PoolType;
    readonly amp: bigint;
    readonly swapFee: bigint;
    readonly tokens: StablePoolToken[];
    private readonly tokenMap;
    private readonly tokenIndexMap;
    static fromRawPool(pool: RawMetaStablePool): MetaStablePool;
    constructor(id: string, amp: bigint, swapFee: bigint, tokens: StablePoolToken[]);
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    subtractSwapFeeAmount(amount: TokenAmount): TokenAmount;
    addSwapFeeAmount(amount: TokenAmount): TokenAmount;
    getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint;
}
export {};
