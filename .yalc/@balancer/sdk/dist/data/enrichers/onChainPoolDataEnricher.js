import BalancerSorQueriesAbi from '../../abi/BalancerSorQueries.json';
import { Interface } from '@ethersproject/abi';
import { jsonRpcFetch } from '../../utils/jsonRpcFetch';
import { formatFixed } from '@ethersproject/bignumber';
import { poolHasActualSupply, poolHasPercentFee, poolHasVirtualSupply, poolIsLinearPool, } from '../../utils';
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
    constructor(rpcUrl, sorQueriesAddress, config) {
        this.rpcUrl = rpcUrl;
        this.sorQueriesAddress = sorQueriesAddress;
        this.sorQueriesInterface = new Interface(BalancerSorQueriesAbi);
        this.config = {
            loadTokenBalanceUpdatesAfterBlock: true,
            blockNumber: 0,
            loadTotalSupply: true,
            loadLinearWrappedTokenRates: true,
            loadSwapFees: true,
            loadAmpForPools: {},
            loadScalingFactorForPools: {},
            loadWeightsForPools: {},
            ...config,
        };
    }
    async fetchAdditionalPoolData(data, options) {
        const rawPools = data.pools;
        if (rawPools.length === 0) {
            return [];
        }
        const { poolIds, weightedPoolIdxs, ampPoolIdxs, linearPoolIdxs, totalSupplyTypes, scalingFactorPoolIdxs, swapFeeTypes, } = this.getPoolDataQueryParams(data);
        console.time('jsonRpcFetch');
        const { balances, amps, linearWrappedTokenRates, totalSupplies, weights, scalingFactors, swapFees, } = await this.fetchOnChainPoolData({
            poolIds,
            config: {
                loadTokenBalanceUpdatesAfterBlock: this.config.loadTokenBalanceUpdatesAfterBlock,
                loadTotalSupply: this.config.loadTotalSupply,
                loadSwapFees: this.config.loadSwapFees,
                loadLinearWrappedTokenRates: this.config.loadLinearWrappedTokenRates,
                loadNormalizedWeights: weightedPoolIdxs.length > 0,
                loadScalingFactors: scalingFactorPoolIdxs.length > 0,
                loadAmps: ampPoolIdxs.length > 0,
                blockNumber: data.syncedToBlockNumber || 0,
                totalSupplyTypes,
                swapFeeTypes,
                linearPoolIdxs,
                weightedPoolIdxs,
                scalingFactorPoolIdxs,
                ampPoolIdxs,
            },
            options,
        });
        console.timeEnd('jsonRpcFetch');
        return poolIds.map((poolId, i) => ({
            id: poolIds[i],
            balances: balances[i],
            totalSupply: totalSupplies[i],
            weights: weightedPoolIdxs.includes(i)
                ? weights[weightedPoolIdxs.indexOf(i)]
                : undefined,
            amp: ampPoolIdxs.includes(i) ? amps[ampPoolIdxs.indexOf(i)] : undefined,
            wrappedTokenRate: linearPoolIdxs.includes(i)
                ? linearWrappedTokenRates[linearPoolIdxs.indexOf(i)]
                : undefined,
            scalingFactors: scalingFactors[i],
            swapFee: swapFees[i],
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
                    priceRate: this.getPoolTokenRate({ pool, token, data, index: idx }),
                    weight: data?.weights ? formatFixed(data.weights[idx], 18) : token.weight,
                })),
                totalShares: data?.totalSupply
                    ? formatFixed(data.totalSupply, 18)
                    : pool.totalShares,
                amp: data?.amp
                    ? formatFixed(data.amp, 3).split('.')[0]
                    : 'amp' in pool
                        ? pool.amp
                        : undefined,
                swapFee: data?.swapFee ? formatFixed(data.swapFee, 18) : pool.swapFee,
            };
        });
    }
    getPoolDataQueryParams(data) {
        const poolIds = [];
        const totalSupplyTypes = [];
        const linearPoolIdxs = [];
        const weightedPoolIdxs = [];
        const ampPoolIdxs = [];
        const scalingFactorPoolIdxs = [];
        const swapFeeTypes = [];
        const { loadScalingFactorForPoolTypes, loadScalingFactorForPoolIds, loadWeightsForPoolTypes, loadAmpForPoolTypes, loadAmpForPoolIds, loadWeightsForPoolIds, } = this.getMergedFilterConfig(data);
        for (let i = 0; i < data.pools.length; i++) {
            const pool = data.pools[i];
            poolIds.push(pool.id);
            totalSupplyTypes.push(poolHasVirtualSupply(pool.poolType)
                ? TotalSupplyType.VIRTUAL_SUPPLY
                : poolHasActualSupply(pool.poolType)
                    ? TotalSupplyType.ACTUAL_SUPPLY
                    : TotalSupplyType.TOTAL_SUPPLY);
            if (poolIsLinearPool(pool.poolType)) {
                linearPoolIdxs.push(i);
            }
            if (loadWeightsForPoolTypes.has(pool.poolType) || loadWeightsForPoolIds.has(pool.id)) {
                weightedPoolIdxs.push(i);
            }
            if (loadAmpForPoolTypes.has(pool.poolType) || loadAmpForPoolIds.has(pool.id)) {
                ampPoolIdxs.push(i);
            }
            if (loadScalingFactorForPoolIds.has(pool.id) ||
                loadScalingFactorForPoolTypes.has(pool.poolType)) {
                scalingFactorPoolIdxs.push(i);
            }
            if (this.config.loadSwapFees) {
                swapFeeTypes.push(poolHasPercentFee(pool.poolType)
                    ? SwapFeeType.PERCENT_FEE
                    : SwapFeeType.SWAP_FEE_PERCENTAGE);
            }
        }
        return {
            poolIds,
            totalSupplyTypes,
            linearPoolIdxs,
            weightedPoolIdxs,
            ampPoolIdxs,
            scalingFactorPoolIdxs,
            swapFeeTypes,
        };
    }
    getMergedFilterConfig({ poolsWithActiveWeightUpdates = [], poolsWithActiveAmpUpdates = [], }) {
        const { loadWeightsForPools, loadScalingFactorForPools, loadAmpForPools } = this.config;
        const loadWeightsForPoolIds = new Set([
            ...poolsWithActiveWeightUpdates,
            ...(loadWeightsForPools.poolIds || []),
        ]);
        const loadAmpForPoolIds = new Set([
            ...poolsWithActiveAmpUpdates,
            ...(loadAmpForPools.poolIds || []),
        ]);
        const loadScalingFactorForPoolIds = new Set(loadScalingFactorForPools.poolIds || []);
        const loadWeightsForPoolTypes = new Set(loadWeightsForPools.poolTypes || []);
        const loadAmpForPoolTypes = new Set(loadAmpForPools.poolTypes || []);
        const loadScalingFactorForPoolTypes = new Set(loadScalingFactorForPools.poolTypes || []);
        return {
            loadWeightsForPoolIds,
            loadAmpForPoolIds,
            loadScalingFactorForPoolIds,
            loadWeightsForPoolTypes,
            loadAmpForPoolTypes,
            loadScalingFactorForPoolTypes,
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
    getPoolTokenRate({ pool, token, data, index, }) {
        if (data?.wrappedTokenRate && 'wrappedIndex' in pool && pool.wrappedIndex === index) {
            return formatFixed(data.wrappedTokenRate, 18);
        }
        if (data?.scalingFactors) {
            return formatFixed(data.scalingFactors[index], 18);
        }
        return token.priceRate;
    }
}
//# sourceMappingURL=onChainPoolDataEnricher.js.map