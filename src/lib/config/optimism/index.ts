import { Config } from '../types';
import contracts from './contracts';

const config: Config = {
  key: '10',
  chainId: 10,
  chainName: 'Optimism',
  name: 'Optimism Mainnet',
  shortName: 'Optimism',
  slug: 'optimism',
  network: 'optimism',
  unknown: false,
  rpc: 'https://mainnet.optimism.io',
  ws: 'wss://ws-mainnet.optimism.io',
  blockTime: 13,
  explorer: 'https://optimistic.etherscan.io/',
  explorerName: 'The Optimism Explorer',
  subgraph:
    'https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-v2-optimism',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-v2-optimism',
    ],
    aave: '',
    gauge:
      'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges-optimism',
    blocks: '',
  },
  supportsEIP1559: false,
  supportsElementPools: false,
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
  keys: {
    infura: '',
    alchemy: '',
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
    type: 5,
    weight: 0,
  },
  pools: {
    IdsMap: {},
    Pagination: {
      PerPage: 10,
      PerPool: 10,
      PerPoolInitial: 5,
    },
    DelegateOwner: '',
    ZeroAddress: '',
    DynamicFees: {
      Gauntlet: [],
    },
    BlockList: [],
    IncludedPoolTypes: [],
    Stable: {
      AllowList: [],
    },
    Investment: {
      AllowList: [],
    },
    Factories: {},
    Stakable: {
      AllowList: [],
    },
    Metadata: {},
    DisabledJoins: [],
    BrandedRedirect: {},
  },
};

export default config;
