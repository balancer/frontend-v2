import { Pools } from '@/types/pools';

const pools: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  BoostsEnabled: false,
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
      '0xe58ca65f418d4121d6c70d4c133e60cf6fda363c000000000000000000000013', // usdc/axlusd
      '0x8c2062ec8d477366c749982e3703371a7ae1e66500000000000000000000001f', // rETH/WETH
      '0xfb4c2e6e6e27b5b4a07a36360c89ede29bb3c9b6000000000000000000000026', // cbeth/weth
      '0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023', // reth/weth
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
      '0x0be4dc963db6ca066ff147069b9c437da683608b00020000000000000000000f', // OGRE/WETH
      '0xa892be6ee527f4fb8b3b60486a53c0627cb1d27e000200000000000000000014', // LINU/WETH
      '0x012e776cc3ed4c5adea3eda8677e82343e4de396000200000000000000000015', // 50WETH/50USDbC
      '0x52e281318fed4efffb8e46c0847a8f9b71a461a8000200000000000000000018', // 50BTC-50WETH
      '0x036d68e4e0005da4ef1c9ebd53b948d2c083495e00020000000000000000001a', // 50BTC-50USD
      '0xe40cbccba664c7b1a953827c062f5070b78de86800020000000000000000001b', // WETH-GOLD
      '0xfab10dd71e11d0ad403cc31418b45d816f2f988200020000000000000000001d', // well-eth
      '0xc69793563a8f0a2c5b25bcfb8661de50da8eae1000020000000000000000001c', // stg-usdc
      '0x17e7d59bb209a3215ccc25fffef7161498b7c10d000200000000000000000020', // weth-gold 99
      '0x3f3e72417d016687f02eb369025f33b60db585cd000200000000000000000022', // 50WETH/50OGRE
      '0xa30ad556d10c829a67f41f60d41afdd4efa9286c000100000000000000000029', // base friend pool
      '0xe94dfd524414220b3f5d321a20b6f9dbc1d53a1f00020000000000000000002d', // sis-weth
      '0xc8dd61ff747c4bf93995a8086a8562f136059dc300020000000000000000002e', // one-cbeth
      '0xfa4ac3ecfece20769f8b5d9b6dfa5b7ed6569de2000200000000000000000033', // weth-mz
      '0x65e8e75899f683c8e2e73c77d6c5c63075f296cd00020000000000000000002b', // sus-weth
      '0x109fb663fbe47bcef8cf1d74759ebb869e390105000200000000000000000037', // 1WETH-99USDbC
      '0x7bd499100daee002c8df900d831a3dc0c2c91040000200000000000000000039', // 85BPT-stabal3-15ONE
      '0x18f150c43598cd822d39711c55bd90407a8b8ad700020000000000000000003b', // 90BPT-50STABAL3-50WETH-10ONE
      '0xce1edbf534b0d787cea315ecdc27bf857b73579300020000000000000000003c', // 50BPT-stabal3-50axlUSDC
      '0x775e01bde8c3f3de0f8ed1fd1331c32580417f5700020000000000000000003f', // 50DAI-50axlUSDC
      '0x35f823b87ea3c1918992f958b7764b4d37c7329400020000000000000000003e', // 50WETH-50USDbC
      '0xb1b1155337d19eb0ef9c75aa88aeb4e531440508000200000000000000000042', // 50WETH-50Gekko
    ],
  },
  Factories: {
    '0x4c32a8a8fda4e24139b51b456b42290f51d6a1c4': 'weightedPool', // Weighted V5
    '0x8df317a729fcaa260306d7de28888932cb579b88': 'composableStablePool', // ComposableStable V5
  },
  Stakable: {
    VotingGaugePools: [],
    AllowList: [
      '0x868f0efc81a6c1df16298dcc82f7926b9099946b00020000000000000000000b', // Bald/weth
      '0x2db50a0e0310723ef0c2a165cb9a9f80d772ba2f00020000000000000000000d', // WETH/stabal3
      '0x6fbfcf88db1aada31f34215b2a1df7fafb4883e900000000000000000000000c', // stabal3
      '0xe58ca65f418d4121d6c70d4c133e60cf6fda363c000000000000000000000013', // usdc/axlusd
      '0x52e281318fed4efffb8e46c0847a8f9b71a461a8000200000000000000000018', // 50BTC-50WETH
      '0x036d68e4e0005da4ef1c9ebd53b948d2c083495e00020000000000000000001a', // 50BTC-50USD
      '0xe40cbccba664c7b1a953827c062f5070b78de86800020000000000000000001b', // WETH-GOLD
      '0xc69793563a8f0a2c5b25bcfb8661de50da8eae1000020000000000000000001c', // stg-usdc
      '0x17e7d59bb209a3215ccc25fffef7161498b7c10d000200000000000000000020', // weth-gold 99
      '0xfb4c2e6e6e27b5b4a07a36360c89ede29bb3c9b6000000000000000000000026', // cbeth/weth
      '0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023', // reth/weth
      '0xa30ad556d10c829a67f41f60d41afdd4efa9286c000100000000000000000029', // base friend pool
      '0xe94dfd524414220b3f5d321a20b6f9dbc1d53a1f00020000000000000000002d', // sis-weth
      '0xfa4ac3ecfece20769f8b5d9b6dfa5b7ed6569de2000200000000000000000033', // weth-mz
      '0x65e8e75899f683c8e2e73c77d6c5c63075f296cd00020000000000000000002b', // sus-weth
      '0xfab10dd71e11d0ad403cc31418b45d816f2f988200020000000000000000001d', // well/weth
    ],
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
