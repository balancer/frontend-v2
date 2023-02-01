import { PoolType, SwapKind } from '../../types';
import { Token, TokenAmount } from '../';
import { RawPool } from '../../data/types';
export interface BasePool {
    poolType: PoolType | string;
    id: string;
    address: string;
    swapFee: bigint;
    tokens: TokenAmount[];
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount): TokenAmount;
    getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint;
}
export interface BasePoolFactory {
    isPoolForFactory(pool: RawPool): boolean;
    create(pool: RawPool): BasePool;
}
