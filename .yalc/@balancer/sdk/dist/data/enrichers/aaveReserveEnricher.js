import { gql, GraphQLClient } from 'graphql-request';
import { default as retry } from 'async-retry';
import Timeout from 'await-timeout';
import { RAY, SECONDS_PER_YEAR, WAD } from '../../utils';
import { formatFixed } from '@ethersproject/bignumber';
export class AaveReserveEnricher {
    constructor(retries = 2, timeout = 30000) {
        this.retries = retries;
        this.timeout = timeout;
        this.aaveClient = new GraphQLClient('https://api.thegraph.com/subgraphs/name/aave/protocol-v2');
    }
    async fetchAdditionalPoolData(pools, syncedToBlockNumber, options) {
        const query = gql `
            query getRates {
                reserves {
                    id
                    underlyingAsset
                    liquidityRate
                    liquidityIndex
                    lastUpdateTimestamp
                }
            }
        `;
        let rates = [];
        await retry(async () => {
            const timeout = new Timeout();
            const getRates = async () => {
                const ratesResult = await this.aaveClient.request(query, {});
                return ratesResult.reserves;
            };
            try {
                const getRatesPromise = getRates();
                const timerPromise = timeout.set(this.timeout).then(() => {
                    throw new Error(`Timed out getting rates from subgraph: ${this.timeout}`);
                });
                rates = await Promise.race([getRatesPromise, timerPromise]);
                return;
            }
            finally {
                timeout.clear();
            }
        }, {
            retries: this.retries,
            onRetry: (err, retry) => {
                console.log(err, retry);
            },
        });
        return rates;
    }
    enrichPoolsWithData(pools, additionalPoolData) {
        for (const pool of pools) {
            if (pool.poolType === 'AaveLinear') {
                const mT = pool.tokens[pool.mainIndex];
                const rateData = additionalPoolData.find(r => r.underlyingAsset === mT.address);
                if (!rateData) {
                    console.error('Wrapped pool token does not have a price rate', pool.id, mT.address);
                    continue;
                }
                const rate = this.getNormalizedIncome(BigInt(rateData.liquidityIndex.toString()), BigInt(rateData.liquidityRate.toString()), BigInt(rateData.lastUpdateTimestamp));
                pool.tokens[pool.wrappedIndex].priceRate = formatFixed(rate.toString(), 18);
            }
        }
        return pools;
    }
    getNormalizedIncome(liquidityIndex, currentLiquidityRate, lastUpdateTimestamp) {
        return ((this.calculateLinearInterest(currentLiquidityRate, lastUpdateTimestamp) *
            liquidityIndex) /
            RAY /
            (RAY / WAD));
    }
    calculateLinearInterest(rate, lastUpdateTimestamp) {
        const timeDifference = BigInt(Math.floor(new Date().getTime() / 1000)) - lastUpdateTimestamp;
        return (rate * timeDifference) / SECONDS_PER_YEAR + RAY;
    }
}
//# sourceMappingURL=aaveReserveEnricher.js.map