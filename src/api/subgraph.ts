export const BALANCER_SUBGRAPH_URL = {
  1: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
  17: 'http://localhost:8000/subgraphs/name/balancer-labs/balancer-v2',
  42: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2'
};

type PoolType = 'Weighted' | 'Stable';

const DAY = 60 * 60 * 24;

interface PoolToken {
  address: string;
  balance: string;
  weight: string;
}

export interface PoolSnapshot {
  pool: {
    id: string;
  };
  timestamp: number;
  amounts: string[];
  totalShares: string;
  swapVolume: string;
  swapFees: string;
}

export interface Pool {
  id: string;
  poolType: PoolType;
  swapFee: string;
  tokensList: string[];
  tokens: PoolToken[];
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

export type GetPoolsRequest = {
  chainId: number;
  poolIds?: string[];
  tokenIds?: string[];
};

export async function getPools({
  chainId,
  poolIds,
  tokenIds
}: GetPoolsRequest) {
  const currentTimestamp = Math.ceil(Date.now() / 1000);
  const timestamp = currentTimestamp - (currentTimestamp % DAY) - DAY;

  const stringifiedPoolIds = poolIds
    ?.map(id => `"${id.toLowerCase()}"`)
    .join(',');
  const stringifiedTokenIds = tokenIds
    ?.map(id => `"${id.toLowerCase()}"`)
    .join(',');

  const poolFilterFragment = poolIds?.length
    ? `, id_in: [${stringifiedPoolIds}]`
    : '';
  const tokenFilterFragment = tokenIds?.length
    ? `, tokensList_contains: [${stringifiedTokenIds}]`
    : '';

  const query = `
    query {
      pools(first: 1000, where: { totalShares_gt: 0${poolFilterFragment}${tokenFilterFragment} }) {
        id
        poolType
        swapFee
        tokensList
        totalLiquidity
        totalShares
        tokens {
          address
          balance
          weight
        }
      }
      poolSnapshots(
        where: {
          timestamp: ${timestamp}
        }
      ) {
        pool {
          id
        }
        swapVolume
        swapFees
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
  return {
    pools: data.pools as Pool[],
    snapshots: data.poolSnapshots as PoolSnapshot[]
  };
}

export async function getPoolEvents(chainId: number, poolId: string) {
  const query = `
    query {
      joins(
        first: 100,
        where: {
          pool: "${poolId}"
        }
      ) {
        amounts
        timestamp
        tx
      }
      exits(
        first: 100,
        where: {
          pool: "${poolId}"
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
  const dayTimestamp = currentTimestamp - (currentTimestamp % DAY);
  const timestamps: number[] = [];
  for (let i = 0; i < days; i++) {
    timestamps.push(dayTimestamp - i * DAY);
  }
  const dayQueries = timestamps.map(timestamp => {
    return `
      _${timestamp}: poolSnapshot(id: "${poolId}-${timestamp}") {
        timestamp
        amounts
        totalShares
        swapVolume
        swapFees
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
        const { amounts, totalShares, swapVolume, swapFees } = data;
        return [
          timestamp * 1000,
          { timestamp, amounts, totalShares, swapVolume, swapFees }
        ];
      })
      .filter(entry => !!entry[1])
  );
  return snapshots as PoolSnapshots;
}

export async function getPoolsById(
  chainId: number,
  ids: string[]
): Promise<Pool[]> {
  const _ids = ids.map(id => `"${id.toLocaleLowerCase()}"`).join(',');

  const query = `
    query {
      pools(first: 1000, where: { id_in: [${_ids}] }) {
        id
        poolType
        swapFee
        tokensList
        totalShares
        tokens {
          address
          balance
          weight
        }
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
  return data.pools;
}
