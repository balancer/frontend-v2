import { Config } from '../types';
import contracts from './contracts';
import tokens from './tokens';

const config: Config = {
  key: '17',
  chainId: 17,
  chainName: 'Ethereum',
  name: 'Docker localhost 8545',
  shortName: 'dockerLocalhost',
  slug: 'docker',
  network: 'docker localhost',
  unknown: false,
  visibleInUI: false,
  testNetwork: true,
  rpc: 'http://localhost:8545',
  ws: 'ws://localhost:8546',
  explorer: '',
  explorerName: '',
  subgraph: 'http://localhost:8000/subgraphs/name/balancer-labs/balancer-v2',
  poolsUrlV2: '',
  subgraphs: {
    main: ['http://localhost:8000/subgraphs/name/balancer-labs/balancer-v2'],
    aave: '',
    gauge: '',
    blocks: '',
    metadata: '',
  },
  bridgeUrl: '',
  supportsEIP1559: false,
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
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'ethereum',
    },
  },
  addresses: {
    ...contracts,
  },
  gauges: {
    type: 1,
    weight: 100,
  },
  pools: {
    IdsMap: {},
    Pagination: {
      PerPage: 10,
      PerPool: 10,
      PerPoolInitial: 5,
    },
    BoostsEnabled: false,
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
    Weighted: {
      AllowList: [],
    },
    Factories: {},
    Stakable: {
      VotingGaugePools: [],
      AllowList: [],
    },
    Metadata: {},
    Deep: [],
    BoostedApr: [],
    DisabledJoins: [],
    BrandedRedirect: {},
  },
  tokens,
  keys: {},
  supportsElementPools: false,
  tokenlists: {
    Balancer: {
      Default: '',
      Vetted: '',
    },
    External: [],
  },
  rateProviders: {},
};

export default config;
