import { PoolType, SwapKind } from '../../../types';
import { BigintIsh, Token, TokenAmount } from '../../';
import { BasePool } from '../../pools';
import { RawLinearPool } from '../../../data/types';
declare class BPT extends TokenAmount {
    readonly rate: bigint;
    readonly virtualBalance: bigint;
    readonly index: number;
    constructor(token: Token, amount: BigintIsh, index: number);
}
declare class WrappedToken extends TokenAmount {
    readonly rate: bigint;
    readonly scale18: bigint;
    readonly index: number;
    constructor(token: Token, amount: BigintIsh, rate: BigintIsh, index: number);
}
export type Params = {
    fee: bigint;
    rate: bigint;
    lowerTarget: bigint;
    upperTarget: bigint;
};
export declare class LinearPool implements BasePool {
    readonly id: string;
    readonly address: string;
    readonly poolType: PoolType;
    readonly poolTypeVersion: number;
    readonly swapFee: bigint;
    readonly mainToken: TokenAmount;
    readonly wrappedToken: WrappedToken;
    readonly bptToken: BPT;
    readonly params: Params;
    readonly tokens: (BPT | WrappedToken | TokenAmount)[];
    private readonly tokenMap;
    static fromRawPool(pool: RawLinearPool): LinearPool;
    constructor(id: string, poolTypeVersion: number, params: Params, mainToken: TokenAmount, wrappedToken: WrappedToken, bptToken: BPT);
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint;
    private _exactMainTokenInForWrappedOut;
    private _exactMainTokenInForBptOut;
    private _exactWrappedTokenInForMainOut;
    private _exactWrappedTokenInForBptOut;
    private _exactBptInForMainOut;
    private _exactBptInForWrappedOut;
    private _mainTokenInForExactWrappedOut;
    private _mainTokenInForExactBptOut;
    private _wrappedTokenInForExactMainOut;
    private _wrappedTokenInForExactBptOut;
    private _bptInForExactMainOut;
    private _bptInForExactWrappedOut;
}
export {};
