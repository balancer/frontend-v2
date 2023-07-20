import { BoostedProtocol } from '@/composables/useBoostedPool';
import { PoolWarning, Pools } from '@/types/pools';

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
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d', // mai
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f', // VST
      '0xd89746affa5483627a87e55713ec1905114394950002000000000000000000bf', // fluid stable
      '0x7bceaa9c5e7f4836fec3bce2d5346637c9b13970000000000000000000000102', // vesta new stable
      '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159', // stETH
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316', // wsteth/weth stable
      '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352', // bbrfusd
      '0x70ba7dc356b41c849e74c679932c852cc0331a90000000000000000000000357', // gdai/mai/usdc
      '0x519cce718fcd11ac09194cff4517f12d263be067000000000000000000000382', // overnight usd+
      '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd', // bb-a-eth / reth
      '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a', // bb-a-usd aave v3
      '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400', // wsteth / bb-a-weth
      '0x161cd105034ac000d2aad75f06c26e943130bc0e000200000000000000000426', // nfte/weth
      '0x542f16da0efb162d20bf4358efa095b70a100f9e000000000000000000000436', // tbtc
      '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452', // dola/bb-a-usd
      '0x8bc65eed474d1a00555825c91feab6a8255c2107000000000000000000000453', // dola/usdc
      '0x01990f1e6f7f32296f125ee9469705c1c070054d000000000000000000000461', // reth/WETH
      '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471', // rETH-bb-a-WETH
      '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470', // wstETH-bb-a-WETH
      '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475', // bb-a-USD
      '0x3fd4954a851ead144c2ff72b1f5a38ea5976bd54000000000000000000000480', // ankreth/wsteth
    ],
  },
  Investment: {
    AllowList: [''],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      '0xd449efa0a587f2cb6be3ae577bc167a7745258100001000000000000000003f4',
      '0xce34c867d7053befb3421d6adabcb5ce55ff777b00010000000000000000041b', // crv/wbtc/wsteth/gdai/uni/link
      '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413', // stg/bb-a-usd
      '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412', // wsteth-bb-a-weth / bb-a-usd
      '0x3efd3e18504dc213188ed2b694f886a305a6e5ed00020000000000000000041d', // peg/weth
      '0x89dc7e71e362faf88d92288fe2311d25c6a1b5e0000200000000000000000423', // ohm/weth
      '0xce6195089b302633ed60f3f427d1380f6a2bfbc7000200000000000000000424', // ohm/usdc
      '0xc69771058481551261709d8db44977e9afde645000010000000000000000042a', // wbtc/wsteth-bb-a-weth/bb-a-usd
      '0x49f3040f6e4dc7ff8fd85502bc40877311ff13d700020000000000000000042b', // dfx/weth
      '0x161cd105034ac000d2aad75f06c26e943130bc0e000200000000000000000426', // nfte/weth
      '0x542f16da0efb162d20bf4358efa095b70a100f9e000000000000000000000436', // tbtc/wbtc
      '0xc9f52540976385a84bf416903e1ca3983c539e34000200000000000000000434', // tbtc/weth
      '0x8d333f82e0693f53fa48c40d5d4547142e907e1d000200000000000000000437', // pal/ohm
      '0x00e7ccb0e16fc07d0cb528efea2c130c41c2fc1600010000000000000000043d', // 25LDO/25wstETH/25RPL/25rETH
      '0xa231aea07bb5e79ae162f95903806fc5ad65ff1100020000000000000000043f', // dfx/weth
      '0xce2da1d3e5b5e4e1913f9ff65ee029d38682d8b900020000000000000000044e', // acid/weth
      '0xd0dc20e6342db2de82692b8dc842301ff9121805000200000000000000000454', // nfte/wsteth-bb-a-weth
      '0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458', // bal/arb/aura
      '0xc7fa3a3527435720f0e2a4c1378335324dd4f9b3000200000000000000000459', // auraBAL/wstETH
      '0x93b48e950380adcf6d67c392f20d44fb88d258dc000200000000000000000465', // usdc.e/usdc
      '0x0e1cdc10a131d07636fb4cf322f79b8df551dd9e00020000000000000000046a', // 50BAL-50WETH
      '0xfcc9a8d58e41cbf582cff798148750637eadb1ff00020000000000000000046c', // 50RDNT-50USDC.e
    ],
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
    '0x2498a2b0d6462d2260eac50ae1c3e03f4829ba95': 'composableStablePool', // ComposableStable V4
    '0xa8920455934da4d853faac1f94fe7bef72943ef1': 'composableStablePool', // ComposableStable V5
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
      '0xa231aea07bb5e79ae162f95903806fc5ad65ff1100020000000000000000043f',
      '0x8d333f82e0693f53fa48c40d5d4547142e907e1d000200000000000000000437',
      '0xce2da1d3e5b5e4e1913f9ff65ee029d38682d8b900020000000000000000044e',
      '0x8bc65eed474d1a00555825c91feab6a8255c2107000000000000000000000453',
      '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452',
      '0xc7fa3a3527435720f0e2a4c1378335324dd4f9b3000200000000000000000459',
      '0x01990f1e6f7f32296f125ee9469705c1c070054d000000000000000000000461',
      '0x26e5c5e2b48815b59640a1a82ac3c2249188daf4000000000000000000000476',
      '0xfa92d9dd808d0e8d68079bdc7f01e74658e1ef15000000000000000000000477',
      '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471',
      '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470',
      '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475',
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
    '0xd0dc20e6342db2de82692b8dc842301ff9121805000200000000000000000454': {
      name: 'NFTE/wsteth-Boosted Aave v3 WETH',
      hasIcon: true,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471': {
      name: 'rETH/Boosted Aave v3 WETH',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470': {
      name: 'wstETH/Boosted Aave v3 WETH',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Aave],
    },
    '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475': {
      name: 'Balancer Boosted Aave v3 USD',
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
    '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452', // dola/bb-a-usd
    '0xd0dc20e6342db2de82692b8dc842301ff9121805000200000000000000000454', // nfte/wsteth-bb-a-weth
    '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471', // rETH-bb-a-WETH
    '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470', // wstETH-bb-a-WETH
    '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475', // bb-a-USD
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
