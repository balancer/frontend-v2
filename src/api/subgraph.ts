interface PoolToken {
  id: string;
  address: string;
  balance: string;
}

interface PoolSnapshot {
  amounts: string[];
  totalShares: string;
}

export interface Pool {
  id: string;
  strategyType: number;
  swapFee: string;
  totalWeight: string;
  tokensList: string[];
  tokens: PoolToken[];
  weights: string[];
  amp: string;
}

export interface PoolSwap {
  tokenIn: string;
  tokenAmountIn: string;
  tokenInSym: string;
  tokenOut: string;
  tokenAmountOut: string;
  tokenOutSym: string;
  timestamp: number;
  tx: string;
}

export interface PoolJoin {
  amounts: string[];
  timestamp: number;
  tx: string;
}

export interface PoolExit {
  amounts: string[];
  timestamp: number;
  tx: string;
}

export interface PoolEvents {
  joins: PoolJoin[];
  exits: PoolExit[];
}

export type PoolSnapshots = Record<number, PoolSnapshot>;

const BALANCER_SUBGRAPH_URL = {
  1: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta',
  17: 'http://localhost:8000/subgraphs/name/balancer-labs/balancer-v2',
  42: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2'
};

export async function getPools(chainId: number) {
  const query = `
    query {
      pools(first: 1000) {
        id
        strategyType
        swapFee
        totalWeight
        tokensList
        tokens {
          id
          address
          balance
        }
        weights
        amp
      }
    }
  `;
  const url = BALANCER_SUBGRAPH_URL[chainId];
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const { data } = await res.json();
  return data.pools as Pool[];
}

export async function getUserPoolEvents(
  chainId: number,
  poolId: string,
  userAddress: string
) {
  const query = `
    query {
      joins(
        first: 100,
        where: {
          pool: "${poolId}",
          sender: "${userAddress}"
        }
      ) {
        amounts
        timestamp
        tx
      }
      exits(
        first: 100,
        where: {
          pool: "${poolId}",
          sender: "${userAddress}"
        }
      ) {
        amounts
        timestamp
        tx
      }
    }
  `;
  const url = BALANCER_SUBGRAPH_URL[chainId];
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const { data } = await res.json();
  return data as PoolEvents;
}

export async function getPoolSnapshots(
  chainId: number,
  poolId: string,
  days: number
) {
  const currentTimestamp = Math.ceil(Date.now() / 1000);
  const dayTimestamp = currentTimestamp - (currentTimestamp % (60 * 60 * 24));
  const timestamps: number[] = [];
  for (let i = 0; i < days; i++) {
    timestamps.push(dayTimestamp - i * (60 * 60 * 24));
  }
  const dayQueries = timestamps.map(timestamp => {
    return `
      _${timestamp}: poolSnapshot(id: "${poolId}-${timestamp}") {
        amounts
        totalShares
      }
    `;
  });
  const query = `
    query {
      ${dayQueries.join('\n')}
    }
  `;
  const url = BALANCER_SUBGRAPH_URL[chainId];
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const { data } = await res.json();
  const snapshotData = data as Record<string, PoolSnapshot>;

  const snapshots = Object.fromEntries(
    Object.entries(snapshotData)
      .map(entry => {
        const [id, data] = entry;
        const timestamp = parseInt(id.substr(1));
        if (!data) {
          return [timestamp, null];
        }
        const { amounts, totalShares } = data;
        return [timestamp * 1000, { amounts, totalShares }];
      })
      .filter(entry => !!entry[1])
  );
  return snapshots as PoolSnapshots;
}
