import { BasePool, Path, Token } from '../entities';
import { PathGraphEdgeData, PathGraphTraversalConfig } from './pathGraphTypes';
export declare class PathGraph {
    private nodes;
    private edges;
    private poolAddressMap;
    private maxPathsPerTokenPair;
    constructor();
    buildGraph({ pools, maxPathsPerTokenPair, }: {
        pools: BasePool[];
        maxPathsPerTokenPair?: number;
    }): void;
    getCandidatePaths({ tokenIn, tokenOut, graphTraversalConfig, }: {
        tokenIn: Token;
        tokenOut: Token;
        graphTraversalConfig?: Partial<PathGraphTraversalConfig>;
    }): Path[];
    private sortAndFilterPaths;
    private buildPoolAddressMap;
    private addAllTokensAsGraphNodes;
    private addTokenPairsAsGraphEdges;
    private addNode;
    /**
     * Returns the vertices connected to a given vertex
     */
    getConnectedVertices(tokenAddress: string): string[];
    /**
     * Adds a directed edge from a source vertex to a destination
     */
    private addEdge;
    findAllValidTokenPaths(args: {
        token: string;
        tokenIn: string;
        tokenOut: string;
        tokenPath: string[];
        config: PathGraphTraversalConfig;
    }): string[][];
    expandTokenPath({ tokenPath, tokenPairIndex, }: {
        tokenPath: string[];
        tokenPairIndex: number;
    }): PathGraphEdgeData[];
    private traverseBfs;
    private isValidTokenPath;
    private isValidPath;
    private getIdForPath;
    private filterVolatilePools;
    private getLimitAmountSwapForPath;
}
