import BalancerSorQueriesAbi from '../../abi/BalancerSorQueries.json';
import { Interface } from '@ethersproject/abi';
import { jsonRpcFetch } from '../../utils/jsonRpcFetch';
import { formatFixed } from '@ethersproject/bignumber';
var TotalSupplyType;
(function (TotalSupplyType) {
    TotalSupplyType[TotalSupplyType["TOTAL_SUPPLY"] = 0] = "TOTAL_SUPPLY";
    TotalSupplyType[TotalSupplyType["VIRTUAL_SUPPLY"] = 1] = "VIRTUAL_SUPPLY";
    TotalSupplyType[TotalSupplyType["ACTUAL_SUPPLY"] = 2] = "ACTUAL_SUPPLY";
})(TotalSupplyType || (TotalSupplyType = {}));
var SwapFeeType;
(function (SwapFeeType) {
    SwapFeeType[SwapFeeType["SWAP_FEE_PERCENTAGE"] = 0] = "SWAP_FEE_PERCENTAGE";
    SwapFeeType[SwapFeeType["PERCENT_FEE"] = 1] = "PERCENT_FEE";
})(SwapFeeType || (SwapFeeType = {}));
export class OnChainPoolDataEnricher {
    constructor(vaultAddress, sorQueriesAddress, rpcUrl) {
        this.vaultAddress = vaultAddress;
        this.sorQueriesAddress = sorQueriesAddress;
        this.rpcUrl = rpcUrl;
        this.sorQueriesInterface = new Interface(BalancerSorQueriesAbi);
    }
    async fetchAdditionalPoolData(rawPools, syncedToBlockNumber, options) {
        if (rawPools.length === 0) {
            return [];
        }
        const { poolIds, config } = this.getPoolDataQueryParams(rawPools, syncedToBlockNumber);
        console.time('jsonRpcFetch');
        const { balances, amps, linearWrappedTokenRates, totalSupplies, weights } = await this.fetchOnChainPoolData({ poolIds, config, options });
        console.timeEnd('jsonRpcFetch');
        return poolIds.map((poolId, i) => ({
            id: poolIds[i],
            balances: balances[i],
            totalSupply: totalSupplies[i],
            weights: config.weightedPoolIdxs.includes(i)
                ? weights[config.weightedPoolIdxs.indexOf(i)]
                : undefined,
            amp: config.ampPoolIdxs.includes(i) ? amps[config.ampPoolIdxs.indexOf(i)] : undefined,
            wrappedTokenRate: config.linearPoolIdxs.includes(i)
                ? linearWrappedTokenRates[config.linearPoolIdxs.indexOf(i)]
                : undefined,
        }));
    }
    enrichPoolsWithData(pools, additionalPoolData) {
        return pools.map(pool => {
            const data = additionalPoolData.find(item => item.id === pool.id);
            return {
                ...pool,
                tokens: pool.tokens.map((token, idx) => ({
                    ...token,
                    balance: data?.balances && data.balances.length > 0
                        ? formatFixed(data.balances[idx], token.decimals)
                        : token.balance,
                    priceRate: data?.wrappedTokenRate && pool.wrappedIndex === idx
                        ? formatFixed(data.wrappedTokenRate, 18)
                        : token.priceRate,
                    weight: data?.weights ? formatFixed(data.weights[idx], 18) : token.weight,
                })),
                totalShares: data?.totalSupply
                    ? formatFixed(data.totalSupply, 18)
                    : pool.totalShares,
                amp: data?.amp
                    ? formatFixed(data.amp, 3).split('.')[0]
                    : pool.amp,
            };
        });
    }
    getPoolDataQueryParams(rawPools, syncedToBlockNumber) {
        const poolIds = [];
        const totalSupplyTypes = [];
        const linearPoolIdxs = [];
        const weightedPoolIdxs = [];
        const ampPoolIdxs = [];
        for (let i = 0; i < rawPools.length; i++) {
            const pool = rawPools[i];
            poolIds.push(pool.id);
            totalSupplyTypes.push(pool.poolType === 'PhantomStable' || this.isLinearPoolType(pool.poolType)
                ? TotalSupplyType.VIRTUAL_SUPPLY
                : pool.poolType === 'ComposableStable'
                    ? TotalSupplyType.ACTUAL_SUPPLY
                    : TotalSupplyType.TOTAL_SUPPLY);
            if (this.isLinearPoolType(pool.poolType)) {
                linearPoolIdxs.push(i);
            }
        }
        return {
            poolIds,
            config: {
                loadTokenBalanceUpdatesAfterBlock: true,
                loadTotalSupply: true,
                loadLinearWrappedTokenRates: true,
                loadNormalizedWeights: true,
                loadAmps: true,
                loadSwapFees: false,
                loadTokenRates: false,
                blockNumber: syncedToBlockNumber || 0,
                totalSupplyTypes,
                linearPoolIdxs,
                weightedPoolIdxs,
                ampPoolIdxs,
                tokenRatePoolIdxs: [],
                swapFeeTypes: [],
            },
        };
    }
    async fetchOnChainPoolData({ poolIds, config, options, }) {
        return jsonRpcFetch({
            rpcUrl: this.rpcUrl,
            to: this.sorQueriesAddress,
            contractInterface: this.sorQueriesInterface,
            functionFragment: 'getPoolData',
            values: [poolIds, config],
            options,
        });
    }
    isStablePoolType(poolType) {
        return (poolType === 'Stable' ||
            poolType === 'MetaStable' ||
            poolType === 'StablePhantom' ||
            poolType === 'ComposableStable');
    }
    isLinearPoolType(poolType) {
        return poolType.includes('Linear');
    }
}
//# sourceMappingURL=onChainPoolDataEnricher.js.map