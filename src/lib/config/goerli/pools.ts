import { BoostedProtocol } from '@/composables/useBoostedPool';
import { Pools } from '@/types/pools';
import StableAllowlist from './allowlists/stable.json';
import WeightedAllowlist from './allowlists/weighted.json';

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
    AllowList: StableAllowlist,
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: WeightedAllowlist,
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
      boosted: true,
    },
    [poolIdWithTwoBoostedProtocols]: {
      name: 'Boosted Aave and Morpho Test Pool',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave, BoostedProtocol.Morpho], // Two boosted protocols for testing purposes
    },
    [reaperBoostedPoolId]: {
      name: 'Reaper Boosted Test Pool',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Reaper], // Explicit Reaper metadata for testing purposes
    },
    [tetuBoostedPoolId]: {
      name: 'Tetu Boosted Test Pool',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Tetu], // Explicit Reaper metadata for testing purposes
    },
    [idleBoostedPoolId]: {
      name: 'Idle Boosted Test Pool',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Idle], // Explicit Reaper metadata for testing purposes
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
};

export default pools;
