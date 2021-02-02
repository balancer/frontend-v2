import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { getCurrentTs, tsToBlockNumber } from '@/utils/index';

const BALANCER_SUBGRAPH_URL = {
  '1': 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-beta',
  '4': 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-rinkeby',
  '42': 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan'
};

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
    const blockNumber = tsToBlockNumber(currentBlockNumber - 5, ts);
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
    const blockNumber = tsToBlockNumber(currentBlockNumber - 5, ts);
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
