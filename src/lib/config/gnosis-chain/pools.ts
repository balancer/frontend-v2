import { Protocol } from '@/composables/useProtocols';
import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { PoolFeature, PoolWarning, Pools } from '@/types/pools';
import { Network } from '../types';

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
      '0x2086f52651837600180de173b09470f54ef7491000000000000000000000004f', // xdai-usdc-usdt
      '0x0c1b9ce6bf6c01f587c2ee98b0ef4b20c6648753000000000000000000000050', // eure-stabal3
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
      '0x0c1b9ce6bf6c01f587c2ee98b0ef4b20c6648753000000000000000000000050',
      '0x00df7f58e1cf932ebe5f54de5970fb2bdf0ef06d00010000000000000000005b', // B-50wstETH-25BAL-25AURA
      '0x4cdabe9e07ca393943acfb9286bbbd0d0a310ff600020000000000000000005c', // B-50wstETH-50COW
      '0xeb30c85cc528537f5350cf5684ce6a4538e13394000200000000000000000059', // B-50USD-50wstETH
      '0x4683e340a8049261057d5ab1b29c8d840e75695e00020000000000000000005a', // B-50wstETH-50GNO
      '0xb8bb1ce9c6e5401d66fe2126db6e7387e1e24ffe00020000000000000000003d', // WETH/GNO
      '0x274dedb9356c3e1e24bfe2bf3d4349fbdbfa0d14000200000000000000000054', // staBAL/GNO
      '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053', // WETH/staBAL/WBTC
      '0x7caef9e452ce161dec936ace7eab571d1023b20900020000000000000000005d', // B-50wstETH-50NEXT
      '0x77e5bf699db38c578b2982c3e262e9c5f1f50fd0000200000000000000000061', // B-50USD-50bIBTA
      '0xe85eb550e98ee66d19c667de24c5c8e10fee6504000200000000000000000060', // B-50USD-50bCSPX
      '0xf6bfffb47bc125564cbb6cc0e7633eb7addaefce00020000000000000000005e', // B-50USD-50bIB01
      '0x5237a12e9d9095cc085f2bdd4e32393993f73c15000200000000000000000062', // 50agEUR-50EURe
    ],
  },
  Factories: {
    '0xc128468b7ce63ea702c1f104d55a2566b13d3abd': 'composableStablePool', // ComposableStable V3
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'weightedPool', // WeightedPool V3
    '0x6cad2ea22bfa7f4c14aae92e47f510cd5c509bc7': 'weightedPool', // weighted pool v4
    '0xd87f44df0159dc78029ab9ca7d7e57e7249f5acd': 'composableStablePool', // ComposableStable V4
    '0x4bdcc2fb18aeb9e2d281b0278d946445070eada7': 'composableStablePool', // ComposableStable V5
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
      '0xb8bb1ce9c6e5401d66fe2126db6e7387e1e24ffe00020000000000000000003d',
      '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053',
      '0x2086f52651837600180de173b09470f54ef7491000000000000000000000004f',
      '0x274dedb9356c3e1e24bfe2bf3d4349fbdbfa0d14000200000000000000000054',
      '0x0c1b9ce6bf6c01f587c2ee98b0ef4b20c6648753000000000000000000000050',
      '0xeb30c85cc528537f5350cf5684ce6a4538e13394000200000000000000000059',
      '0x4683e340a8049261057d5ab1b29c8d840e75695e00020000000000000000005a',
      '0x4cdabe9e07ca393943acfb9286bbbd0d0a310ff600020000000000000000005c',
      '0x00df7f58e1cf932ebe5f54de5970fb2bdf0ef06d00010000000000000000005b',
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
  Deprecated: {
    '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012': {
      newPool:
        '0xb8bb1ce9c6e5401d66fe2126db6e7387e1e24ffe00020000000000000000003d',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0xba1a5b19d09a79dada039b1f974015c5a989d5fd000100000000000000000046': {
      newPool:
        '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0xe15cac1df3621e001f76210ab12a7f1a1691481f000000000000000000000044': {
      newPool:
        '0x2086f52651837600180de173b09470f54ef7491000000000000000000000004f',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0x4de21b365d6543661d0e105e579a34b963862497000200000000000000000045': {
      newPool:
        '0x274dedb9356c3e1e24bfe2bf3d4349fbdbfa0d14000200000000000000000054',
      description: 'deprecatedPool.hasNewPool.description',
    },
  },
  BoostedApr: [],
  DisabledJoins: [...CSP_ISSUE_POOL_IDS[Network.GNOSIS]],
  Issues: {
    [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.GNOSIS],
  },
};

export default pools;
