import { Router } from './router';
import { SwapKind } from './types';
import { PoolParser } from './entities/pools/parser';
import { PoolDataService } from './data/poolDataService';
export class SmartOrderRouter {
    constructor({ chainId, provider, options, poolDataProviders, poolDataEnrichers = [], customPoolFactories = [], }) {
        this.chainId = chainId;
        this.provider = provider;
        this.router = new Router();
        this.poolParser = new PoolParser(customPoolFactories);
        this.poolDataService = new PoolDataService(Array.isArray(poolDataProviders) ? poolDataProviders : [poolDataProviders], Array.isArray(poolDataEnrichers) ? poolDataEnrichers : [poolDataEnrichers]);
    }
    async getSwaps(tokenIn, tokenOut, swapKind, swapAmount, swapOptions) {
        const rawPools = await this.poolDataService.getEnrichedPools(swapOptions);
        const pools = this.poolParser.parseRawPools(rawPools);
        const candidatePaths = this.router.getCandidatePaths(tokenIn, tokenOut, swapKind, pools);
        const bestPaths = await this.router.getBestPaths(candidatePaths, swapKind, swapAmount);
        const swapInfo = {
            quote: swapKind === SwapKind.GivenIn ? bestPaths.outputAmount : bestPaths.inputAmount,
            swap: bestPaths,
        };
        return swapInfo;
    }
    async getSwapsWithPools(tokenIn, tokenOut, swapKind, swapAmount, pools, swapOptions) {
        const candidatePaths = this.router.getCandidatePaths(tokenIn, tokenOut, swapKind, pools);
        const bestPaths = await this.router.getBestPaths(candidatePaths, swapKind, swapAmount);
        const swapInfo = {
            quote: swapKind === SwapKind.GivenIn ? bestPaths.outputAmount : bestPaths.inputAmount,
            swap: bestPaths,
        };
        return swapInfo;
    }
    async fetchPools(swapOptions) {
        const rawPools = await this.poolDataService.getEnrichedPools(swapOptions);
        const pools = this.poolParser.parseRawPools(rawPools);
        return pools;
    }
}
//# sourceMappingURL=sor.js.map