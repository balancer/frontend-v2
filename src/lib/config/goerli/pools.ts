import { Protocol } from '@/composables/useProtocols';
import { PoolFeature, Pools, RiskKey } from '@/types/pools';

export const poolIdThatRequiresInternalBalanceExit =
  '0xd4e7c1f3da1144c9e2cfd1b015eda7652b4a439900000000000000000000046a';

export const boostedPoolId =
  '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f';

export const poolIdWithTwoBoostedProtocols =
  '0x35acd56c585d7ebb4a9460f7c8f50be60dc080cd000000000000000000000054';

export const reaperBoostedPoolId =
  '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035x';

export const tetuBoostedPoolId =
  '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000036x';

export const idleBoostedPoolId =
  '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000037x';

const pools: Pools = {
  IdsMap: {
    staBAL:
      '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    bbAaveUSD: {
      v1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
      v2: '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
      v3: '',
    },
    veBAL: '0xf8a0623ab66f985effc1c69d05f1af4badb01b00000200000000000000000060',
  },
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
  BlockList: [
    '0x22d398c68030ef6b1c55321cca6e0cecc5c93b2f000200000000000000000678',
  ],
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
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
      '0xb60e46d90f2de35f7062a27d3a98749414036d5d000200000000000000000061',
      '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
      '0xc957b1acceb21707b782eb8eee2ed8e20088463d000200000000000000000076',
      '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7',
      '0x14f93df8a4e37bfdb49d2cec4789df7a010603d700000000000000000000011d',
      '0x00a62d31b6c776b6813543bc99ff265f7222dbe100000000000000000000011e',
      '0x0c925fce89a22e36ebd9b3c6e0262234e853d2f600000000000000000000019c',
      '0x1542b8783e5e884b6fe7422dd2f71a42c5edb86d0000000000000000000002f3',
      '0xa7c0335079841076dfff02f621730927e896dd9700020000000000000000083a', // uniETH / WETH
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Deprecated list, no longer in use
    AllowList: [
      '0xbb372d299cc1afa14d5b8691ced1486fa0216f74000200000000000000000757', // DVT /WETH
      '0x4dc5ef9b11fd462d78e197f8a98089933174b2c5000200000000000000000836', //tkn1/tkn2
      '0x44c5b44fb1995449bdb1d6127b25652e793df012000200000000000000000859',
      '0xcd5875624640f9dfc5ca7ae9d41499d65e2dfd090002000000000000000008ce', // 50TOT-50USDC A
    ],
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0x44afeb87c871d8fea9398a026dea2bd3a13f5769': 'stablePool',
    '0xa55f73e2281c60206ba43a3590db07b8955832be': 'stablePool', // Metastable
    '0xb48cc42c45d262534e46d5965a9ac496f1b7a830': 'liquidityBootstrappingPool',
    '0xb0c726778c3ae4b3454d85557a48e8fa502bdd6a': 'liquidityBootstrappingPool', // LBP (zero protocol fee)
    '0x41e9036ae350baedcc7107760a020dca3c0731ec': 'boostedPool',
    '0xb848f50141f3d4255b37ac288c25c109104f2158': 'composableStablePool',
    '0x94f68b54191f62f781fe8298a8a5fa3ed772d227': 'weightedPool', // weighted pool v2
    '0x230a59f4d9adc147480f03b0d3fffecd56c3289a': 'weightedPool', // weighted pool v4
  },
  Stakable: {
    VotingGaugePools: [
      '0x16faf9f73748013155b7bc116a3008b57332d1e600020000000000000000005b',
      '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
      '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
    ],
    AllowList: [
      '0x67f8fcb9d3c463da05de1392efdbb2a87f8599ea000200000000000000000059',
    ],
  },
  Metadata: {
    [boostedPoolId]: {
      name: 'Balancer Boosted Aave USD',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {},
      },
    },
    [poolIdWithTwoBoostedProtocols]: {
      name: 'Boosted Aave and Morpho Test Pool',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Aave, Protocol.Morpho],
        },
      },
    },
    [reaperBoostedPoolId]: {
      name: 'Reaper Boosted Test Pool',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Reaper],
        },
      },
    },
    [tetuBoostedPoolId]: {
      name: 'Tetu Boosted Test Pool',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Tetu],
        },
      },
    },
    [idleBoostedPoolId]: {
      name: 'Idle Boosted Test Pool',
      hasIcon: false,
      features: {
        [PoolFeature.Boosted]: {
          featureProtocols: [Protocol.Idle],
        },
      },
    },
  },
  Deep: [
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f', // bb-a-USD1 (goerli)
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e0000000000000000000001a7', // bb-a-USD2 (goerli)
  ],
  BoostedApr: [
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd', // bb-a-USD1
    '0x3d5981bdd8d3e49eb7bbdc1d2b156a3ee019c18e', // bb-a-USD2
  ],
  DisabledJoins: [
    'testaddresswithdisabledjoins', //Used for unit testing
  ],
  Deprecated: {
    '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062': {},
    '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f': {},
    '0x6a8f9ab364b85725973d2a33cb9aae2dac43b5e30000000000000000000000a6': {},
    deprecatedid: {}, //Used for unit testing
  },
  ExitViaInternalBalance: [poolIdThatRequiresInternalBalanceExit],
  Risks: {
    '0x5aee1e99fe86960377de9f88689616916d5dcabe000000000000000000000467': [
      RiskKey.RateProviderBridge,
    ],
  },
};

export default pools;
