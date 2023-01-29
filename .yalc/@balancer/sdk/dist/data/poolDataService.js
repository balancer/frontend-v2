export class PoolDataService {
    constructor(providers, enrichers) {
        this.providers = providers;
        this.enrichers = enrichers;
    }
    async getEnrichedPools(options) {
        //TODO: might be necessary to remove duplicates, decide which take precendence
        const responses = await Promise.all(this.providers.map(provider => provider.getPools(options)));
        let pools = responses.map(response => response.pools).flat();
        //we take the smallest block number from the set
        const syncedToBlockNumber = responses
            .map(response => response.syncedToBlockNumber || 0)
            .sort()[0];
        const additionalPoolData = await Promise.all(this.enrichers.map(provider => provider.fetchAdditionalPoolData(pools, syncedToBlockNumber, options)));
        // We enrich the pools in order of the enrichers array
        for (let i = 0; i < this.enrichers.length; i++) {
            pools = this.enrichers[i].enrichPoolsWithData(pools, additionalPoolData[i]);
        }
        return pools;
    }
}
//# sourceMappingURL=poolDataService.js.map