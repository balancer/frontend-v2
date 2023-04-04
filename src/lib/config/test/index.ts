import { Config } from '../types';
import keys from './keys';

const config: Config = {
  key: '12345',
  chainId: 12345,
  chainName: 'test',
  name: 'test',
  shortName: 'test',
  slug: 'test',
  network: 'test',
  unknown: false,
  visibleInUI: false,
  testNetwork: true,
  rpc: `https://mainnet.infura.io/v3/${keys.infura}`,
  ws: 'ws://balancer.fi:1234',
  explorer: 'https://etherscan.io',
  explorerName: 'Etherscan',
  subgraph: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
  poolsUrlV2:
    'https://storageapi.fleek.co/johngrantuk-team-bucket/poolsV2.json',
  subgraphs: {
    main: ['https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2'],
    aave: '',
    gauge: '',
    blocks: '',
  },
  bridgeUrl: '',
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
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'ethereum',
    },
  },
  addresses: {
    merkleRedeem: '0x6d19b2bF3A36A61530909Ae65445a906D98A2Fa8',
    merkleOrchard: '',
    multicall: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
    authorizer: '0xA331D84eC860Bf466b4CdCcFb4aC09a1B43F3aE6',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    weightedPoolFactory: '0x8E9aa87E45e92bad84D5F8DD1bff34Fb92637dE9',
    stablePoolFactory: '0xc66Ba2B6595D3613CCab350C886aCE23866EDe24',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    rETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    stMATIC: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
    stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    lidoRelayer: '',
    balancerHelpers: '0x5aDDCCa35b7A0D07C74063c48700C8590E87864E',
    batchRelayer: '',
    gaugeFactory: '',
    balancerMinter: '',
    gaugeController: '',
    tokenAdmin: '',
    veBAL: '',
    veDelegationProxy: '',
    veBALHelpers: '',
    feeDistributor: '',
    feeDistributorDeprecated: '',
    faucet: '',
  },
  keys,
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
    BoostsEnabled: true,
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
    Deep: [],
    BoostedApr: [],
    Metadata: {},
    DisabledJoins: [],
    BrandedRedirect: {},
  },
  tokens: {
    Popular: {
      Symbols: [],
    },
    InitialSwapTokens: {
      input: '',
      output: '',
    },
    Addresses: {
      nativeAsset: '',
      wNativeAsset: '',
      WETH: '',
      BAL: '',
    },
  },
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
