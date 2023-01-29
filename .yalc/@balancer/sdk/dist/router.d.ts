import { SwapKind } from './types';
import { BasePool, Path, Swap, Token, TokenAmount } from './entities';
export declare class Router {
    cache: Record<string, {
        paths: Path[];
    }>;
    private readonly pathGraph;
    constructor();
    getCandidatePaths: (tokenIn: Token, tokenOut: Token, swapKind: SwapKind, pools: BasePool[]) => Path[];
    getBestPaths: (paths: Path[], swapKind: SwapKind, swapAmount: TokenAmount) => Promise<Swap>;
}
