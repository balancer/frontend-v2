import { PoolType, SwapKind } from '../../../types';
import { BigintIsh, Token, TokenAmount } from '../../';
import { BasePool } from '../../pools';
import { RawLinearPool } from '../../../data/types';
export declare class BPT extends TokenAmount {
    readonly rate: bigint;
    readonly virtualBalance: bigint;
    constructor(token: Token, amount: BigintIsh);
}
export declare class WrappedToken extends TokenAmount {
    readonly rate: bigint;
    readonly scale18: bigint;
    constructor(token: Token, amount: BigintIsh, rate: BigintIsh);
}
export type Params = {
    fee: bigint;
    rate: bigint;
    lowerTarget: bigint;
    upperTarget: bigint;
};
export declare class LinearPool implements BasePool {
    id: string;
    address: string;
    poolType: PoolType;
    poolTypeVersion: number;
    swapFee: bigint;
    tokens: Array<BPT | TokenAmount | WrappedToken>;
    mainToken: TokenAmount;
    wrappedToken: WrappedToken;
    bptToken: BPT;
    params: Params;
    static fromRawPool(pool: RawLinearPool): LinearPool;
    constructor(id: string, poolTypeVersion: number, tokens: Array<BPT | TokenAmount | WrappedToken>, params: Params, mainToken: TokenAmount, wrappedToken: WrappedToken, bptToken: BPT);
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
