import { BasePool, BasePoolFactory, Path, Token, TokenAmount } from './entities';
import { SorConfig, SwapInfo, SwapKind, SwapOptions } from './types';
import { RawPool } from './data/types';
import { PathGraphTraversalConfig } from './pathGraph/pathGraphTypes';
export declare class SmartOrderRouter {
    private readonly chainId;
    private readonly provider;
    private readonly router;
    private readonly poolParser;
    private readonly poolDataService;
    private pools;
    private blockNumber;
    private poolsProviderData;
    constructor({ chainId, provider, options, poolDataProviders, rpcUrl, poolDataEnrichers, customPoolFactories, }: SorConfig);
    fetchAndCachePools(blockNumber?: number): Promise<BasePool[]>;
    fetchAndCacheLatestPoolEnrichmentData(blockNumber?: number): Promise<void>;
    get isInitialized(): boolean;
    getSwaps(tokenIn: Token, tokenOut: Token, swapKind: SwapKind, swapAmount: TokenAmount, swapOptions?: SwapOptions): Promise<SwapInfo>;
    getCandidatePaths(tokenIn: Token, tokenOut: Token, swapKind: SwapKind, options?: Pick<SwapOptions, 'block' | 'graphTraversalConfig'>): Promise<Path[]>;
    static parseRawPools({ pools, customPoolFactories, }: {
        pools: RawPool[];
        customPoolFactories?: BasePoolFactory[];
    }): BasePool[];
    static getSwapsWithPools({ tokenIn, tokenOut, swapKind, swapAmount, pools, swapOptions, }: {
        tokenIn: Token;
        tokenOut: Token;
        swapKind: SwapKind;
        swapAmount: TokenAmount;
        pools: BasePool[];
        swapOptions?: Omit<SwapOptions, 'graphTraversalConfig'> & {
            graphTraversalConfig: Omit<PathGraphTraversalConfig, 'poolIdsToInclude'>;
        };
    }): Promise<{
        quote: TokenAmount;
        swap: import("./entities").Swap;
    }>;
}
