import { BigNumber } from '@ethersproject/bignumber';
import { BaseProvider } from '@ethersproject/providers';
import { Router } from './router';
import { BasePool, Swap, Token, TokenAmount } from './entities';
import { ChainId } from './utils';
import { SorConfig, SwapKind, SwapOptions } from './types';
export interface SwapInfo {
    quote: TokenAmount;
    swap: Swap;
}
export type TransactionData = {
    calldata: string;
    value: BigNumber;
};
export declare class SmartOrderRouter {
    chainId: ChainId;
    provider: BaseProvider;
    readonly router: Router;
    private readonly poolParser;
    private readonly poolDataService;
    constructor({ chainId, provider, options, poolDataProviders, poolDataEnrichers, customPoolFactories, }: SorConfig);
    getSwaps(tokenIn: Token, tokenOut: Token, swapKind: SwapKind, swapAmount: TokenAmount, swapOptions?: SwapOptions): Promise<SwapInfo>;
    getSwapsWithPools(tokenIn: Token, tokenOut: Token, swapKind: SwapKind, swapAmount: TokenAmount, pools: BasePool[], swapOptions?: SwapOptions): Promise<SwapInfo>;
    fetchPools(swapOptions?: SwapOptions): Promise<BasePool[]>;
}
