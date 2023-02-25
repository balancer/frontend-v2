import { SwapKind } from './types';
import { WAD } from './utils/math';
import { PathWithAmount, Swap } from './entities';
import { PathGraph } from './pathGraph/pathGraph';
export class Router {
    constructor() {
        this.pathGraph = new PathGraph();
    }
    getCandidatePaths(tokenIn, tokenOut, swapKind, pools, graphTraversalConfig) {
        console.time('build graph and get candidate paths');
        this.pathGraph.buildGraph({ pools });
        const candidatePaths = this.pathGraph.getCandidatePaths({
            tokenIn,
            tokenOut,
            graphTraversalConfig,
        });
        console.timeEnd('build graph and get candidate paths');
        return candidatePaths;
    }
    async getBestPaths(paths, swapKind, swapAmount) {
        if (paths.length === 0) {
            throw new Error('No potential swap paths provided');
        }
        const quotePaths = [];
        // Check if PathWithAmount is valid (each hop pool swap limit)
        paths.forEach(path => {
            try {
                quotePaths.push(new PathWithAmount(path.tokens, path.pools, swapAmount));
            }
            catch {
                return;
            }
        });
        let valueArr;
        if (swapKind === SwapKind.GivenIn) {
            (valueArr = quotePaths.map(item => {
                return {
                    item,
                    value: Number(item.outputAmount.amount),
                };
            })),
                valueArr.sort((a, b) => b.value - a.value);
        }
        else {
            (valueArr = quotePaths.map(item => {
                return {
                    item,
                    value: Number(item.inputAmount.amount),
                };
            })),
                valueArr.sort((a, b) => a.value - b.value);
        }
        const orderedQuotePaths = valueArr.map(item => item.item);
        // If there is only one path, return it
        if (orderedQuotePaths.length === 1) {
            return await Swap.fromPaths(orderedQuotePaths, swapKind, swapAmount);
        }
        // Split swapAmount in half, making sure not to lose dust
        const swapAmount50up = swapAmount.mulDownFixed(WAD / 2n);
        const swapAmount50down = swapAmount.sub(swapAmount50up);
        const path50up = new PathWithAmount(orderedQuotePaths[0].tokens, orderedQuotePaths[0].pools, swapAmount50up);
        const path50down = new PathWithAmount(orderedQuotePaths[1].tokens, orderedQuotePaths[1].pools, swapAmount50down);
        const swap = await Swap.fromPaths(orderedQuotePaths.slice(0, 1), swapKind, swapAmount);
        const swapSplit = await Swap.fromPaths([path50up, path50down], swapKind, swapAmount);
        if (swapKind === SwapKind.GivenIn) {
            if (swap.outputAmount.amount > swapSplit.outputAmount.amount) {
                return swap;
            }
            else {
                return swapSplit;
            }
        }
        else {
            if (swap.inputAmount.amount < swapSplit.inputAmount.amount) {
                return swap;
            }
            else {
                return swapSplit;
            }
        }
    }
}
//# sourceMappingURL=router.js.map