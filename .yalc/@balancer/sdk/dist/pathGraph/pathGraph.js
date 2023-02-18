import { TokenAmount } from '../entities';
import { PoolType, SwapKind } from '../types';
const DEFAULT_MAX_PATHS_PER_TOKEN_PAIR = 2;
export class PathGraph {
    constructor() {
        this.maxPathsPerTokenPair = DEFAULT_MAX_PATHS_PER_TOKEN_PAIR;
        this.nodes = new Map();
        this.edges = new Map();
        this.poolAddressMap = new Map();
    }
    // We build a directed graph for all pools.
    // Nodes are tokens and edges are triads: [pool.id, tokenIn, tokenOut].
    // The current criterion for including a pool path into this graph is the following:
    // (a) We include every path that includes a phantom BPT.
    // (b) For any token pair x -> y, we include only the most liquid ${maxPathsPerTokenPair}
    // pool pairs (default 2).
    buildGraph({ pools, maxPathsPerTokenPair = DEFAULT_MAX_PATHS_PER_TOKEN_PAIR, }) {
        this.poolAddressMap = new Map();
        this.nodes = new Map();
        this.edges = new Map();
        this.maxPathsPerTokenPair = maxPathsPerTokenPair;
        this.buildPoolAddressMap(pools);
        this.addAllTokensAsGraphNodes(pools);
        this.addTokenPairsAsGraphEdges({ pools, maxPathsPerTokenPair });
    }
    // Since the path combinations here can get quite large, we use configurable parameters
    // to enforce upper limits across several dimensions, defined in the pathConfig.
    // (a) maxDepth - the max depth of the traversal (length of token path), defaults to 7.
    // (b) maxNonBoostedPathDepth - the max depth for any path that does not contain a phantom bpt.
    // (c) maxNonBoostedHopTokensInBoostedPath - The max number of non boosted hop tokens
    // allowed in a boosted path.
    // (d) approxPathsToReturn - search for up to this many paths. Since all paths for a single traversal
    // are added, its possible that the amount returned is larger than this number.
    // (e) poolIdsToInclude - Only include paths with these poolIds (optional)
    // Additionally, we impose the following requirements for a path to be considered valid
    // (a) It does not visit the same token twice
    // (b) It does not use the same pool twice
    getCandidatePaths({ tokenIn, tokenOut, graphTraversalConfig, }) {
        // apply defaults, allowing caller override whatever they'd like
        const config = {
            maxDepth: 7,
            maxNonBoostedPathDepth: 3,
            maxNonBoostedHopTokensInBoostedPath: 1,
            approxPathsToReturn: 5,
            ...graphTraversalConfig,
        };
        const tokenPaths = this.findAllValidTokenPaths({
            token: tokenIn.wrapped,
            tokenIn: tokenIn.wrapped,
            tokenOut: tokenOut.wrapped,
            config,
            tokenPath: [tokenIn.wrapped],
        }).sort((a, b) => (a.length < b.length ? -1 : 1));
        const paths = [];
        const selectedPathIds = [];
        while (paths.length < config.approxPathsToReturn) {
            // the tokenPairIndex refers to the nth most liquid path for a token
            // pair x -> y. maxPathsPerTokenPair is provided as a config on graph init
            for (let idx = 0; idx < this.maxPathsPerTokenPair; idx++) {
                for (let i = 0; i < tokenPaths.length; i++) {
                    const path = this.expandTokenPath({
                        tokenPath: tokenPaths[i],
                        tokenPairIndex: idx,
                    });
                    if (this.isValidPath({ path, seenPoolAddresses: [], selectedPathIds, config })) {
                        selectedPathIds.push(this.getIdForPath(path));
                        paths.push(path);
                    }
                }
            }
        }
        return this.sortAndFilterPaths(paths).map(path => {
            const pathTokens = [...path.map(segment => segment.tokenOut)];
            pathTokens.unshift(path[0].tokenIn);
            return {
                tokens: pathTokens,
                pools: path.map(segment => segment.pool),
            };
        });
    }
    sortAndFilterPaths(paths) {
        const pathsWithLimits = paths
            .map(path => {
            let limit = 0n;
            try {
                limit = this.getLimitAmountSwapForPath(path, SwapKind.GivenIn);
            }
            catch {
                // TODO: remove this once bpt swaps are implemented on the stable pool
            }
            return { path, limit };
        })
            .sort((a, b) => (a.limit < b.limit ? 1 : -1));
        const filtered = [];
        // Remove any paths with duplicate pools. since the paths are now sorted by limit,
        // selecting the first path will always be the optimal.
        for (const { path } of pathsWithLimits) {
            let seenPools = [];
            let isValid = true;
            for (const segment of path) {
                if (seenPools.includes(segment.pool.id)) {
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                filtered.push(path);
                seenPools = [...seenPools, ...path.map(segment => segment.pool.id)];
            }
        }
        return filtered;
    }
    buildPoolAddressMap(pools) {
        for (const pool of pools) {
            this.poolAddressMap.set(pool.address, pool);
        }
    }
    addAllTokensAsGraphNodes(pools) {
        for (const pool of pools) {
            for (const tokenAmount of pool.tokens) {
                const token = tokenAmount.token;
                if (!this.nodes.has(token.wrapped)) {
                    this.addNode(token);
                }
            }
        }
    }
    addTokenPairsAsGraphEdges({ pools, maxPathsPerTokenPair, }) {
        for (const pool of pools) {
            for (let i = 0; i < pool.tokens.length - 1; i++) {
                for (let j = i + 1; j < pool.tokens.length; j++) {
                    const tokenI = pool.tokens[i].token;
                    const tokenJ = pool.tokens[j].token;
                    this.addEdge({
                        edgeProps: {
                            pool,
                            tokenIn: tokenI,
                            tokenOut: tokenJ,
                            normalizedLiquidity: pool.getNormalizedLiquidity(tokenI, tokenJ),
                        },
                        maxPathsPerTokenPair,
                    });
                    this.addEdge({
                        edgeProps: {
                            pool,
                            tokenIn: tokenJ,
                            tokenOut: tokenI,
                            normalizedLiquidity: pool.getNormalizedLiquidity(tokenJ, tokenI),
                        },
                        maxPathsPerTokenPair,
                    });
                }
            }
        }
    }
    addNode(token) {
        this.nodes.set(token.wrapped, {
            isPhantomBpt: !!this.poolAddressMap[token.wrapped],
        });
        if (!this.edges.has(token.wrapped)) {
            this.edges.set(token.wrapped, new Map());
        }
    }
    /**
     * Returns the vertices connected to a given vertex
     */
    getConnectedVertices(tokenAddress) {
        const result = [];
        const edges = this.edges.get(tokenAddress) || [];
        for (const [otherToken] of edges) {
            result.push(otherToken);
        }
        return result;
    }
    /**
     * Adds a directed edge from a source vertex to a destination
     */
    addEdge({ edgeProps, maxPathsPerTokenPair, }) {
        const tokenInVertex = this.nodes.get(edgeProps.tokenIn.wrapped);
        const tokenOutVertex = this.nodes.get(edgeProps.tokenOut.wrapped);
        const tokenInNode = this.edges.get(edgeProps.tokenIn.wrapped);
        if (!tokenInVertex || !tokenOutVertex || !tokenInNode) {
            throw new Error('Attempting to add invalid edge');
        }
        const hasPhantomBpt = tokenInVertex.isPhantomBpt || tokenOutVertex.isPhantomBpt;
        const existingEdges = tokenInNode.get(edgeProps.tokenOut.wrapped) || [];
        //TODO: ideally we don't call sort every time, this isn't performant
        const sorted = [...existingEdges, edgeProps].sort((a, b) => a.normalizedLiquidity > b.normalizedLiquidity ? -1 : 1);
        tokenInNode.set(edgeProps.tokenOut.wrapped, sorted.length > maxPathsPerTokenPair && !hasPhantomBpt ? sorted.slice(0, 2) : sorted);
    }
    findAllValidTokenPaths(args) {
        const tokenPaths = [];
        this.traverseBfs({
            ...args,
            callback: tokenPath => {
                tokenPaths.push(tokenPath);
            },
        });
        return tokenPaths;
    }
    expandTokenPath({ tokenPath, tokenPairIndex, }) {
        const segments = [];
        for (let i = 0; i < tokenPath.length - 1; i++) {
            const edge = this.edges.get(tokenPath[i])?.get(tokenPath[i + 1]);
            if (!edge || edge.length === 0) {
                throw new Error(`Missing edge for pair ${tokenPath[i]} -> ${tokenPath[i + 1]}`);
            }
            segments.push(edge[tokenPairIndex] || edge[0]);
        }
        return segments;
    }
    traverseBfs({ token, tokenIn, tokenOut, tokenPath, callback, config, }) {
        const neighbors = this.getConnectedVertices(token);
        for (const neighbor of neighbors) {
            const validTokenPath = this.isValidTokenPath({
                tokenPath: [...tokenPath, neighbor],
                tokenIn,
                tokenOut,
                config,
            });
            if (validTokenPath && neighbor === tokenOut) {
                callback([...tokenPath, neighbor]);
            }
            else if (validTokenPath && !tokenPath.includes(neighbor)) {
                this.traverseBfs({
                    tokenPath: [...tokenPath, neighbor],
                    token: neighbor,
                    tokenIn,
                    tokenOut,
                    callback,
                    config,
                });
            }
        }
    }
    isValidTokenPath({ tokenPath, config, tokenIn, tokenOut, }) {
        const isCompletePath = tokenPath[tokenPath.length - 1] === tokenOut;
        const hopTokens = tokenPath.filter(token => token !== tokenIn && token !== tokenOut);
        const numStandardHopTokens = hopTokens.filter(token => !this.poolAddressMap.has(token)).length;
        const isBoostedPath = tokenPath.filter(token => this.poolAddressMap.has(token)).length > 0;
        if (tokenPath.length > config.maxDepth) {
            return false;
        }
        if (isBoostedPath && numStandardHopTokens > config.maxNonBoostedHopTokensInBoostedPath) {
            return false;
        }
        // if the path length is greater than maxNonBoostedPathDepth, then this path
        // will only be valid if its a boosted path, so it must honor maxNonBoostedHopTokensInBoostedPath
        if (tokenPath.length > config.maxNonBoostedPathDepth &&
            numStandardHopTokens > config.maxNonBoostedHopTokensInBoostedPath) {
            return false;
        }
        if (isCompletePath && !isBoostedPath && tokenPath.length > config.maxNonBoostedPathDepth) {
            return false;
        }
        return true;
    }
    isValidPath({ path, seenPoolAddresses, selectedPathIds, config, }) {
        const poolIdsInPath = path.map(segment => segment.pool.id);
        const uniquePools = [...new Set(poolIdsInPath)];
        if (config.poolIdsToInclude) {
            for (const poolId of poolIdsInPath) {
                if (!config.poolIdsToInclude.includes(poolId)) {
                    //path includes a pool that is not allowed for this traversal
                    return false;
                }
            }
        }
        //dont include any path that hops through the same pool twice
        if (uniquePools.length !== poolIdsInPath.length) {
            return false;
        }
        for (const segment of path) {
            if (seenPoolAddresses.includes(segment.pool.address)) {
                //this path contains a pool that has already been used
                return false;
            }
        }
        //this is a duplicate path
        if (selectedPathIds.includes(this.getIdForPath(path))) {
            return false;
        }
        return true;
    }
    getIdForPath(path) {
        let id = '';
        for (const segment of path) {
            if (id.length > 0) {
                id += '_';
            }
            id += `${segment.pool.id}-${segment.tokenIn}-${segment.tokenOut}`;
        }
        return id;
    }
    filterVolatilePools(poolAddresses) {
        const filtered = [];
        for (const poolAddress of poolAddresses) {
            if (this.poolAddressMap.get(poolAddress)?.poolType === PoolType.Weighted) {
                filtered.push(poolAddress);
            }
        }
        return filtered;
    }
    getLimitAmountSwapForPath(path, swapKind) {
        let limit = path[path.length - 1].pool.getLimitAmountSwap(path[path.length - 1].tokenIn, path[path.length - 1].tokenOut, swapKind);
        for (let i = path.length - 2; i >= 0; i--) {
            const poolLimitExactIn = path[i].pool.getLimitAmountSwap(path[i].tokenIn, path[i].tokenOut, SwapKind.GivenIn);
            const poolLimitExactOut = path[i].pool.getLimitAmountSwap(path[i].tokenIn, path[i].tokenOut, SwapKind.GivenOut);
            if (poolLimitExactOut <= limit) {
                limit = poolLimitExactIn;
            }
            else {
                const pulledLimit = path[i].pool.swapGivenOut(path[i].tokenIn, path[i].tokenOut, TokenAmount.fromRawAmount(path[i].tokenOut, limit)).amount;
                limit = pulledLimit > poolLimitExactIn ? poolLimitExactIn : pulledLimit;
            }
        }
        return limit;
    }
}
//# sourceMappingURL=pathGraph.js.map