import { BoostedProtocol } from '@/composables/useBoostedPool';
import { PoolWarning, Pools } from '@/types/pools';
import StableAllowlist from './allowlists/stable.json';
import WeightedAllowlist from './allowlists/weighted.json';

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
    AllowList: StableAllowlist,
  },
  Investment: {
    AllowList: [''],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: WeightedAllowlist,
  },
  Factories: {
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xef44d6786b2b4d544b7850fe67ce6381626bf2d6': 'stablePool', // stable pool v2
    '0xaeb406b0e430bf5ea2dc0b9fe62e4e53f74b3a33': 'composableStablePool', // ComposableStable
    '0x8df6efec5547e31b0eb7d1291b511ff8a2bf987c': 'weightedPool', // weighted pool v2
    '0x1c99324edc771c82a0dccb780cc7dda0045e50e7': 'composableStablePool', // ComposableStable V3
    '0xf1665e19bc105be4edd3739f88315cc699cc5b65': 'weightedPool', // Weighted Pool V3
    '0xc7e5ed1054a24ef31d827e6f86caa58b3bc168d7': 'weightedPool', // weighted pool v4
  },
  Stakable: {
    VotingGaugePools: [
      '0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002',
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
      '0x0adeb25cb5920d4f7447af4a0428072edc2cee2200020000000000000000004a',
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016',
      '0x1779900c7707885720d39aa741f4086886307e9e00020000000000000000004b',
      '0x4a3a22a3e7fee0ffbb66f1c28bfac50f75546fc7000200000000000000000008',
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
      '0x651e00ffd5ecfa7f3d4f33d62ede0a97cf62ede2000200000000000000000006',
      '0xb28670b3e7ad27bd41fb5938136bf9e9cba90d6500020000000000000000001e',
      '0xb340b6b1a34019853cb05b2de6ee8ffd0b89a008000100000000000000000036',
      '0xb5b77f1ad2b520df01612399258e7787af63025d000200000000000000000010',
      '0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017',
      '0xc61ff48f94d801c1ceface0289085197b5ec44f000020000000000000000004d',
      '0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001',
      '0xe1b40094f1446722c424c598ac412d590e0b3ffb000200000000000000000076',
      '0xb3028ca124b80cfe6e9ca57b70ef2f0ccc41ebd40002000000000000000000ba',
      '0x7bceaa9c5e7f4836fec3bce2d5346637c9b13970000000000000000000000102',
      '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159',
      '0x178e029173417b1f9c8bc16dcec6f697bc323746000200000000000000000158',
      '0x13f2f70a951fb99d48ede6e25b0bdf06914db33f00020000000000000000016b',
      '0xf93579002dbe8046c43fefe86ec78b1112247bb800020000000000000000021d',
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
      '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352',
      '0x519cce718fcd11ac09194cff4517f12d263be067000000000000000000000382',
      '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003bd',
      '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd',
      '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a',
      '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400',
      '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413',
      '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412',
      '0x4fd63966879300cafafbb35d157dc5229278ed2300020000000000000000002b',
      '0x542f16da0efb162d20bf4358efa095b70a100f9e000000000000000000000436',
      '0xc9f52540976385a84bf416903e1ca3983c539e34000200000000000000000434',
    ],
    AllowList: [],
  },
  Metadata: {
    '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352': {
      name: 'Balancer Boosted Reaper Granary USD',
      hasIcon: true,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Reaper],
    },
    '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd': {
      name: 'rETH/Boosted Aave v3 WETH',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413': {
      name: 'STG/Boosted Aave v3 USD',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412': {
      name: 'wstETH/Boosted Aave v3 WETH/Boosted Aave v3 USD',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a': {
      name: 'Balancer Boosted Aave v3 USD',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400': {
      name: 'wstETH/Boosted Aave v3 WETH',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
  },
  Deep: [
    '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352', // bb-rf-usd (arbitrum)
    '0x519cce718fcd11ac09194cff4517f12d263be067000000000000000000000382', // overnight usd+
    '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd', // bb-a-eth / reth
    '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a', // bb-a-usd aave v3
    '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400', // wsteth / bb-a-weth
    '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413', // stg/ bb-a-usd
    '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412', // wsteth-bb-a-weth / bb-a-usd
  ],
  Deprecated: {
    // '0x178e029173417b1f9c8bc16dcec6f697bc323746000200000000000000000158': {
    //   newPool:
    //     '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412 ',
    //   description: 'deprecatedPool.gaugeKilledReason',
    // },
  },
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [],
  Issues: {
    [PoolWarning.PoolOwnerVulnWarningGovernance]: [
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
    ],
    [PoolWarning.PoolOwnerVulnWarningEcosystem]: [
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
    ],
  },
};

export default pools;
