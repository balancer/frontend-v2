import { SwapKind } from './types';
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
        // TODO: swapAmount is being used in full on both paths
        //       this should only be for ordering and then figuring out best split
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
        const swap = await Swap.fromPaths(orderedQuotePaths.slice(0, 1), swapKind, swapAmount);
        return swap;
    }
}
//# sourceMappingURL=router.js.map