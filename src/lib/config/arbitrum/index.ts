import keys from './keys';
import contracts from './contracts';
import pools from './pools';

export default {
  key: '42161',
  chainId: 42161,
  chainName: 'Arbitrum',
  name: 'Arbitrum',
  shortName: 'Arbitrum',
  slug: 'arbitrum',
  network: 'arbitrum-one',
  unknown: false,
  rpc: `https://arb-mainnet.g.alchemy.com/v2/${keys.alchemy}`,
  ws: `wss://arb-mainnet.g.alchemy.com/v2/${keys.alchemy}`,
  publicRpc: 'https://arb1.arbitrum.io/rpc',
  explorer: 'https://arbiscan.io',
  explorerName: 'Arbiscan',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV1: '',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2',
    ],
    aave: '',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-arbitrum',
    blocks:
      'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
  },
  supportsEIP1559: false,
  supportsElementPools: false,
  blockTime: 2,
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
    type: 3,
    weight: 0,
  },
};
