import contracts from './contracts';
import pools from './pools';

export default {
  key: '137',
  chainId: 137,
  chainName: 'Polygon',
  name: 'Polygon Mainnet',
  shortName: 'Polygon',
  slug: 'polygon',
  network: 'polygon',
  unknown: false,
  rpc: 'https://polygon-mainnet.infura.io/v3/{{INFURA_KEY}}',
  ws: 'wss://polygon-mainnet.g.alchemy.com/v2/{{ALCHEMY_KEY}}',
  publicRpc: 'https://polygon-rpc.com',
  explorer: 'https://polygonscan.com',
  explorerName: 'Polygonscan',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-prune-v2',
  balancerApi: 'https://api.balancer.fi',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-prune-v2',
    ],
    aave: 'https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-polygon',
    blocks: 'https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks',
  },
  supportsEIP1559: true,
  supportsElementPools: false,
  blockTime: 4,
  nativeAsset: {
    name: 'Matic',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'MATIC',
    decimals: 18,
    deeplinkId: 'matic',
    logoURI: 'tokens/matic.svg',
    minTransactionBuffer: '0.1',
  },
  addresses: {
    ...contracts,
  },
  pools,
  keys: {
    infura: 'daaa68ec242643719749dd1caba2fc66',
    alchemy: 'ODJ9G5Ipv-Hb2zTWMNbUFIqv9WtqBOc2',
    balancerApi: 'da2-7a3ukmnw7bexndpx5x522uafui',
  },
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
    type: 4,
    weight: 0,
  },
};
