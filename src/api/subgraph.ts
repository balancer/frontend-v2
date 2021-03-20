interface PoolToken {
  id: string;
  address: string;
  balance: string;
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
