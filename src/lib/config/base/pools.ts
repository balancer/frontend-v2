import { Pools } from '@/types/pools';

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
      '0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000c', // stabal3
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      '0xcde67b70e8144d7d2772de59845b3a67266c2ca7000200000000000000000009', // BAL/DAI
      '0x868f0efc81a6c1df16298dcc82f7926b9099946b00020000000000000000000b', // Bald/weth
      '0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d', // Weth/stabal3
      '0x2423d6e341270bcd5add138bc3d4058857d5455f00020000000000000000000e', // WETH/DAI
    ],
  },
  Factories: {
    '0x4c32a8a8fda4e24139b51b456b42290f51d6a1c4': 'weightedPool', // Weighted V5
    '0x8df317a729fcaa260306d7de28888932cb579b88': 'composableStablePool', // ComposableStable V5
  },
  Stakable: {
    VotingGaugePools: [],
    AllowList: [],
  },
  Metadata: {
    '0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000c': {
      name: 'Balancer Stable USD',
      hasIcon: false,
    },
    '0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d': {
      name: 'WETH/Balancer Stable USD',
      hasIcon: false,
    },
  },
  Deep: [
    '0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d', // Weth/stabal
  ],
  Deprecated: {},
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [],
  Issues: {},
};

export default pools;
