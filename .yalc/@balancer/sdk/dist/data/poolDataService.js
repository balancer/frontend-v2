import { jsonRpcGetBlockTimestampByNumber } from '../utils/jsonRpcFetch';
export class PoolDataService {
    constructor(providers, enrichers, rpcUrl) {
        this.providers = providers;
        this.enrichers = enrichers;
        this.rpcUrl = rpcUrl;
    }
    async fetchEnrichedPools(blockNumber) {
        const providerOptions = {
            block: blockNumber,
            timestamp: await this.getTimestampForBlockNumber(blockNumber),
        };
        //TODO: might be necessary to remove duplicates, decide which take precendence
        const responses = await Promise.all(this.providers.map(provider => provider.getPools(providerOptions)));
        const providerData = {
            pools: responses.map(response => response.pools).flat(),
            //we take the smallest block number from the set
            syncedToBlockNumber: responses
                .map(response => response.syncedToBlockNumber || 0)
                .sort()[0],
            poolsWithActiveWeightUpdates: responses
                .map(response => response.poolsWithActiveWeightUpdates || [])
                .flat(),
            poolsWithActiveAmpUpdates: responses
                .map(response => response.poolsWithActiveAmpUpdates || [])
                .flat(),
        };
        return {
            rawPools: await this.enrichPools(providerData, providerOptions),
            providerData,
        };
    }
    async enrichPools(data, providerOptions) {
        let pools = data.pools;
        const additionalPoolData = await Promise.all(this.enrichers.map(provider => provider.fetchAdditionalPoolData(data, providerOptions)));
        // We enrich the pools in order of the enrichers array
        for (let i = 0; i < this.enrichers.length; i++) {
            pools = this.enrichers[i].enrichPoolsWithData(pools, additionalPoolData[i]);
        }
        return pools;
    }
    async getTimestampForBlockNumber(blockNumber) {
        return blockNumber
            ? await jsonRpcGetBlockTimestampByNumber({
                rpcUrl: this.rpcUrl,
                blockNumber,
            })
            : Math.floor(new Date().getTime() / 1000);
    }
}
//# sourceMappingURL=poolDataService.js.map