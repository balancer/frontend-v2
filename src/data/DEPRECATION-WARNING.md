# ⚠️ voting-gauges.json will be deleted on `November 27, 2023`

`voting-gauges.json` is deprecated and will be deleted on **November 27, 2023**

## Migration process

You can find the equivalent list of pools/gauges in the following GraphQL endpoint:

[https://backend-v3.beets-ftm-node.com/](https://backend-v3.beets-ftm-node.com/)

```graphql
query VeBalGetVotingList {
  veBalGetVotingList {
    id
    address
    chain
    type
    symbol
    gauge {
      address
      isKilled
      relativeWeightCap
      addedTimestamp
      childGaugeAddress
    }
    tokens {
      address
      logoURI
      symbol
      weight
    }
  }
}
```
