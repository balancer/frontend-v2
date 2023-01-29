import { PoolType } from '../../../types';
import { Token, TokenAmount, BigintIsh } from '../../';
import { BasePool } from '../';
import { RawComposableStablePool } from '../../../data/types';
export declare class StablePoolToken extends TokenAmount {
    readonly rate: bigint;
    readonly scale18: bigint;
    constructor(token: Token, amount: BigintIsh, rate: BigintIsh);
}
export declare class StablePool implements BasePool {
    id: string;
    address: string;
    poolType: PoolType;
    amp: bigint;
    swapFee: bigint;
    tokens: StablePoolToken[];
    bptIndex: number;
    static fromRawPool(pool: RawComposableStablePool): StablePool;
    constructor(id: string, amp: bigint, swapFee: bigint, tokens: StablePoolToken[]);
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    subtractSwapFeeAmount(amount: TokenAmount): TokenAmount;
    addSwapFeeAmount(amount: TokenAmount): TokenAmount;
}
