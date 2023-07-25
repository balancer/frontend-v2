import { Protocol } from '@/composables/useProtocols';
import { PoolFeature, Pools } from '@/types/pools';

const pools: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  BoostsEnabled: true,
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  IncludedPoolTypes: [
    'Weighted',
    'Stable',
    'MetaStable',
    'LiquidityBootstrapping',
    'Investment',
    'StablePhantom',
    'ComposableStable',
  ],
  Stable: {
    AllowList: [
      '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // bb-ag-usd
      '0x9949f1884b61a8265e12056650c1ac4677a75403000000000000000000000014', // 2EUR (EURe)
      '0xa611a551b95b205ccd9490657acf7899daee5db700000000000000000000002e', // EURe / bb-ag-usd
      '0x5c78d05b8ecf97507d1cf70646082c54faa4da95000000000000000000000030', // agEUR / EURe
      '0xbad20c15a773bf03ab973302f61fabcea5101f0a000000000000000000000034', // WETH / wstETH
      '0xe15cac1df3621e001f76210ab12a7f1a1691481f000000000000000000000044', // bb-ag-USD
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      '0xa99fd9950b5d5dceeaf4939e221dca8ca9b938ab000100000000000000000025', // 25WETH-25BAL-25GNO-25wxDAI
      '0x388cae2f7d3704c937313d990298ba67d70a3709000200000000000000000026', // 50AGVE-50GNO
      '0x4bcf6b48906fa0f68bea1fc255869a41241d4851000200000000000000000021', // 50WXDAI-50MPS
      '0x5519e2d8a0af0944ea639c6dbad69a174de3ecf800010000000000000000003b', // 25BAL-25GNO-25bb-WETH-wstETH-25wxDAI
      '0xbc130c4989e10941142b34f054eb38d69fdce9df000200000000000000000049', // 20XOC-80USDC
      '0xba1a5b19d09a79dada039b1f974015c5a989d5fd000100000000000000000046', // agUSD-agWETH-agWBTC
      '0x4de21b365d6543661d0e105e579a34b963862497000200000000000000000045', // 50bbagGNO-50bbagUSD
    ],
  },
  Factories: {
    '0xc128468b7ce63ea702c1f104d55a2566b13d3abd': 'composableStablePool', // ComposableStable V3
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'weightedPool', // WeightedPool V3
    '0x6cad2ea22bfa7f4c14aae92e47f510cd5c509bc7': 'weightedPool', // weighted pool v4
    '0xd87f44df0159dc78029ab9ca7d7e57e7249f5acd': 'composableStablePool', // ComposableStable V4
  },
  Stakable: {
    VotingGaugePools: [
      '0x66f33ae36dd80327744207a48122f874634b3ada000100000000000000000013',
      '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012',
      '0xb973ca96a3f0d61045f53255e319aedb6ed49240000200000000000000000011',
      '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010',
      '0xbad20c15a773bf03ab973302f61fabcea5101f0a000000000000000000000034',
      '0x5c78d05b8ecf97507d1cf70646082c54faa4da95000000000000000000000030',
      '0x21d4c792ea7e38e0d0819c2011a2b1cb7252bd9900020000000000000000001e',
      '0xba1a5b19d09a79dada039b1f974015c5a989d5fd000100000000000000000046',
      '0x4de21b365d6543661d0e105e579a34b963862497000200000000000000000045',
      '0xe15cac1df3621e001f76210ab12a7f1a1691481f000000000000000000000044',
    ],
    AllowList: [],
  },
  Metadata: {
    '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010': {
      name: 'Balancer Boosted Agave USD',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Agave],
        },
      },
    },
    '0x4de21b365d6543661d0e105e579a34b963862497000200000000000000000045': {
      name: 'Balancer Boosted Agave GNO/USD',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Agave],
        },
      },
    },
    '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012': {
      name: 'Balancer Boosted Agave GNO/WETH',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Agave],
        },
      },
    },
    '0xba1a5b19d09a79dada039b1f974015c5a989d5fd000100000000000000000046': {
      name: 'Balancer Boosted Agave WETH/WBTC/USD',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Agave],
        },
      },
    },
  },
  Deep: [
    '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // agave stable
    '0x66f33ae36dd80327744207a48122f874634b3ada000100000000000000000013', // agave tricrypto
    '0xb973ca96a3f0d61045f53255e319aedb6ed49240000200000000000000000011', // agave gno/usdc
    '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012', // agave gno/weth
    '0xe15cac1df3621e001f76210ab12a7f1a1691481f000000000000000000000044', // bb-ag-USD
    '0xba1a5b19d09a79dada039b1f974015c5a989d5fd000100000000000000000046', // agUSD-agWETH-agWBTC
    '0x4de21b365d6543661d0e105e579a34b963862497000200000000000000000045', // 50bbagGNO-50bbagUSD
  ],
  BoostedApr: [],
  DisabledJoins: [],
};

export default pools;
