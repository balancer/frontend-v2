import keys from './keys';
import contracts from './contracts';
import pools from './pools';
import { Config } from '../types';

const config: Config = {
  key: '137',
  chainId: 137,
  chainName: 'Polygon',
  name: 'Polygon Mainnet',
  shortName: 'Polygon',
  slug: 'polygon',
  network: 'polygon',
  unknown: false,
  rpc: `https://polygon-mainnet.infura.io/v3/${keys.infura}`,
  ws: `wss://polygon-mainnet.g.alchemy.com/v2/${keys.infura}`,
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
  keys,
  gauges: {
    type: 4,
    weight: 0,
  },
};

export default config;
