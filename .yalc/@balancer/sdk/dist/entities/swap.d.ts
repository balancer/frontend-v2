import { PathWithAmount } from './path';
import { TokenAmount } from './';
import { SwapKind, BatchSwapStep } from '../types';
import { BaseProvider } from '@ethersproject/providers';
export declare class Swap {
    static fromPaths(fromPaths: PathWithAmount[], swapKind: SwapKind, swapAmount: TokenAmount): Promise<Swap>;
    protected constructor({ paths, swapKind, swapAmount, }: {
        paths: {
            path: PathWithAmount;
            inputAmount: TokenAmount;
            outputAmount: TokenAmount;
        }[];
        swapKind: SwapKind;
        swapAmount: TokenAmount;
    });
    readonly isNativeSwap: boolean;
    readonly isBatchSwap: boolean;
    readonly paths: {
        path: PathWithAmount;
        inputAmount: TokenAmount;
        outputAmount: TokenAmount;
    }[];
    readonly assets: string[];
    readonly swapKind: SwapKind;
    swaps: BatchSwapStep[];
    get inputAmount(): TokenAmount;
    get outputAmount(): TokenAmount;
    query(provider: BaseProvider, block?: number): Promise<TokenAmount>;
    callData(): string;
}
