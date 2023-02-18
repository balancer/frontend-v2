import { SwapKind } from './types';
import { BasePool, Path, Swap, Token, TokenAmount } from './entities';
import { PathGraphTraversalConfig } from './pathGraph/pathGraphTypes';
export declare class Router {
    private readonly pathGraph;
    constructor();
    getCandidatePaths(tokenIn: Token, tokenOut: Token, swapKind: SwapKind, pools: BasePool[], graphTraversalConfig?: Partial<PathGraphTraversalConfig>): Path[];
    getBestPaths(paths: Path[], swapKind: SwapKind, swapAmount: TokenAmount): Promise<Swap>;
}
