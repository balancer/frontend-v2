import contracts from './contracts';
import keys from './keys';
import pools from './pools';

export default {
  key: '1',
  chainId: 1,
  chainName: 'Ethereum',
  name: 'Ethereum Mainnet',
  shortName: 'Mainnet',
  slug: 'ethereum',
  network: 'homestead',
  unknown: false,
  rpc: `https://mainnet.infura.io/v3/${keys.infura}`,
  ws: `wss://mainnet.infura.io/ws/v3/${keys.infura}`,
  explorer: 'https://etherscan.io',
  explorerName: 'Etherscan',
  subgraph: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
      `https://gateway.thegraph.com/api/${keys.graph}/subgraphs/id/GAWNgiGrA9eRce5gha9tWc7q5DPvN3fs5rSJ6tEULFNM`,
    ],
    aave: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges',
    blocks:
      'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  },
  supportsEIP1559: true,
  supportsElementPools: true,
  blockTime: 12,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI: 'tokens/eth.png',
    minTransactionBuffer: '0.05',
  },
  addresses: {
    ...contracts,
  },
  pools,
  strategies: {
    '0': {
      type: '0',
      name: 'stablePool',
    },
    '1': {
      type: '1',
      name: 'weightedPool',
    },
    '2': {
      type: '2',
      name: 'weightedPool',
    },
  },
  gauges: {
    type: 2,
    weight: 100,
  },
};
