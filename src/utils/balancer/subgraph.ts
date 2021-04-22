import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { getCurrentTs, tsToBlockNumber } from '@/utils';

const BALANCER_SUBGRAPH_URL = {
  '1': 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
  '17': 'http://localhost:8000/subgraphs/name/balancer-labs/balancer-v2',
  '42':
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2'
};

export async function subgraphRequest(url: string, query, options: any = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: JSON.stringify({ query: jsonToGraphQLQuery({ query }) })
  });
  const { data } = await res.json();
  return data || {};
}

export async function getBPTMarketChart(
  network: string,
  currentBlockNumber: number,
  poolId: string,
  days: number
) {
  const query = {};
  const currentTs = getCurrentTs();
  for (let i = 0; i < days; i++) {
    const ts = currentTs - i * (60 * 60 * 24);
    const date = new Date();
    date.setTime(ts * 1e3);
    const id = date
      .toISOString()
      .split('T')[0]
      .replace('-', '')
      .replace('-', '');
    const blockNumber = tsToBlockNumber(currentBlockNumber - 10, ts);
    query[`_${id}`] = {
      __aliasFor: 'pool',
      __args: {
        id: poolId,
        block: {
          number: blockNumber
        }
      },
      totalShares: true,
      liquidity: true
    };
  }
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return Object.entries(result)
    .map((data: any) => [
      parseInt(data[0].slice(1)),
      parseFloat(data[1].liquidity) / parseFloat(data[1].totalShares)
    ])
    .sort((a, b) => a[0] - b[0])
    .map(data => {
      const year = data[0].toString().slice(0, 4);
      const month = data[0].toString().slice(4, 6);
      const day = data[0].toString().slice(6, 8);
      return [`${year}-${month}-${day}`, data[1]];
    });
}

export async function getTokenMarketChart(
  network: string,
  currentBlockNumber: number,
  token: string,
  days: number
) {
  const query = {};
  const currentTs = getCurrentTs();
  for (let i = 0; i < days; i++) {
    const ts = currentTs - i * (60 * 60 * 24);
    const date = new Date();
    date.setTime(ts * 1e3);
    const id = date
      .toISOString()
      .split('T')[0]
      .replace('-', '')
      .replace('-', '');
    const blockNumber = tsToBlockNumber(currentBlockNumber - 10, ts);
    query[`_${id}`] = {
      __aliasFor: 'tokenPrice',
      __args: {
        id: token,
        block: {
          number: blockNumber
        }
      },
      price: true
    };
  }
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return Object.entries(result)
    .map((data: any) => [parseInt(data[0].slice(1)), parseFloat(data[1].price)])
    .sort((a, b) => a[0] - b[0])
    .map(data => {
      const year = data[0].toString().slice(0, 4);
      const month = data[0].toString().slice(4, 6);
      const day = data[0].toString().slice(6, 8);
      return [`${year}-${month}-${day}`, data[1]];
    });
}

export async function getPoolTokens(network, id) {
  const query = {
    pool: {
      __args: {
        id
      },
      tokensList: true
    }
  };
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return result?.pool?.tokensList;
}

export async function getPoolIds(network) {
  const query = {
    pools: {
      __args: {
        first: 1000
      },
      id: true
    }
  };
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return result?.pools?.map(pool => pool.id);
}

export async function getPoolVolume(network: string) {
  const currentTs = getCurrentTs();
  const ts = currentTs - 60 * 60 * 24;
  const query = {
    pools: {
      __args: {
        first: 1000
      },
      id: true,
      totalSwapVolume: true,
      swaps: {
        __args: {
          where: {
            timestamp_lt: ts
          },
          totalSwapVolume: true
        }
      }
    }
  };
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return result?.pools?.map(pool => {
    return {
      id: pool.id,
      totalSwapVolume: pool.totalSwapVolume,
      swaps: pool.swaps
    };
  });
}

export async function getPoolShares(network: string, address: string) {
  const query = {
    poolShares: {
      __args: {
        first: 1000,
        where: {
          userAddress: address.toLowerCase(),
          balance_gt: 0
        }
      },
      poolId: {
        id: true
      },
      balance: true
    }
  };
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return result?.poolShares;
}

export async function getPoolSharesChart(
  network: string,
  currentBlockNumber: number,
  account: string,
  days: number
) {
  const query = {};
  const currentTs = getCurrentTs();
  for (let i = 0; i < days; i++) {
    const ts = currentTs - i * (60 * 60 * 24);
    const date = new Date();
    date.setTime(ts * 1e3);
    const id = date
      .toISOString()
      .split('T')[0]
      .replace('-', '')
      .replace('-', '');
    const blockNumber = tsToBlockNumber(currentBlockNumber - 10, ts);
    query[`_${id}`] = {
      __aliasFor: 'poolShares',
      __args: {
        block: {
          number: blockNumber
        },
        first: 1000,
        where: {
          userAddress: account.toLowerCase(),
          balance_gt: 0
        }
      },
      balance: true,
      poolId: {
        id: true,
        totalShares: true,
        totalLiquidity: true
      }
    };
  }

  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  const formatedResults = Object.entries(result)
    .map((data: any) => [
      parseInt(data[0].slice(1)),
      data[1]
        .map(poolShare => {
          const poolLiquidity = parseFloat(poolShare.poolId.totalLiquidity);
          return (
            (poolLiquidity / parseFloat(poolShare.poolId.totalShares)) *
            parseFloat(poolShare.balance)
          );
        })
        .reduce((a, b) => a + b, 0)
    ])
    .sort((a, b) => a[0] - b[0])
    .map(data => {
      const year = data[0].toString().slice(0, 4);
      const month = data[0].toString().slice(4, 6);
      const day = data[0].toString().slice(6, 8);
      const value = data[1];
      return [`${year}-${month}-${day}`, value];
    });
  return {
    categories: formatedResults.map(row => row[0]),
    series: [
      {
        name: 'Value ($)',
        data: formatedResults.map(row => row[1])
      }
    ]
  };
}

export async function getPoolsLiquidity(network: string, poolIds: string[]) {
  const query = {
    pools: {
      __args: {
        first: 1000,
        where: {
          id_in: poolIds
        }
      },
      id: true,
      totalLiquidity: true
    }
  };

  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL[network], query);
  return Object.fromEntries(
    result.pools.map(pool => [pool.id, { liquidity: pool.totalLiquidity }])
  );
}
