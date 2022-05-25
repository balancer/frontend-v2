import { Network } from '@balancer-labs/sdk';

import { isMainnet, networkId } from '@/composables/useNetwork';

export const MIN_FIAT_VALUE_POOL_MIGRATION = isMainnet.value ? 100_000 : 1; // 100K USD or $1 for other networks

// Do not display APR values greater than this amount; they are likely to be nonsensical
// These can arise from pools with extremely low balances (e.g., completed LBPs)
export const APR_THRESHOLD = 10_000;

export type FactoryType =
  | 'oracleWeightedPool'
  | 'weightedPool'
  | 'stablePool'
  | 'managedPool'
  | 'liquidityBootstrappingPool'
  | 'boostedPool';

export type Pools = {
  IdsMap: Partial<Record<'staBAL' | 'bbAaveUSD' | 'B-80BAL-20WETH', string>>;
  Pagination: {
    PerPage: number;
    PerPool: number;
    PerPoolInitial: number;
  };
  DelegateOwner: string;
  ZeroAddress: string;
  DynamicFees: {
    Gauntlet: string[];
  };
  BlockList: string[];
  ExcludedPoolTypes: string[];
  Stable: {
    AllowList: string[];
  };
  Investment: {
    AllowList: string[];
  };
  Factories: Record<string, FactoryType>;
  Stakable: {
    AllowList: string[];
  };
};

const POOLS_KOVAN: Pools = {
  IdsMap: {
    staBAL:
      '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e',
    bbAaveUSD:
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8',
    'B-80BAL-20WETH':
      '0xdc2ecfdf2688f92c85064be0b929693acc6dbca6000200000000000000000701'
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: []
  },
  BlockList: [
    '0x22d398c68030ef6b1c55321cca6e0cecc5c93b2f000200000000000000000678',
    '0xca1eb8624be8e11418f629559321587197557e0c000200000000000000000682',
    '0xa21da5768186c1bc0f56dd72aa94672d77bdf23e00020000000000000000067a',
    '0x7f9db0d15eea32e205b7df0fa5184f4a8a905abb000200000000000000000683',
    '0x72c5a86831f019df6fac146fc14ef60ebe0d5f2600020000000000000000067f',
    '0x542b9f6fd4500b94d453974d8c70783ef794ff6a00020000000000000000067c',
    '0x47f9309a8c5a68a93ac27a4cccc0e222cd3adfa2000200000000000000000684',
    '0x3f3050a0fe84778aeff96906c9218b318f924d22000200000000000000000680',
    '0x31e61587b5dc148ae42ae323655fb8d7af7bb86600020000000000000000067d',
    '0x28efa7f86341aa0ad534bdfb033edb4f4ac6adf700020000000000000000067e',
    '0x10ee90b9ff4b9a44a773107280c0ce083619286800020000000000000000067b'
  ],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear', 'ERC4626Linear'],
  Stable: {
    AllowList: [
      '0x6b15a01b5d46a5321b627bd7deef1af57bc629070000000000000000000000d4', // kovan
      '0xe08590bde837eb9b2d42aa1196469d6e08fe96ec000200000000000000000101', // kovan
      '0xb4c23af48e79f73e3a7e36c0e54eb38e1ce1755e0002000000000000000000d3', // kovan
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8', // kovan bb-a-USD,
      '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e' // kovan staBAL3,
    ]
  },
  Investment: {
    AllowList: [
      '0x4fd63966879300cafafbb35d157dc5229278ed23000100000000000000000169', // kovan
      '0x37a6fc079cad790e556baedda879358e076ef1b3000100000000000000000348' // WSB Kovan
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x1b57f637ce3408f1f834b0b70f9a595b062daea7': 'liquidityBootstrappingPool',
    '0x751dfdace1ad995ff13c927f6f761c6604532c79': 'stablePool', // Kovan
    '0x590e544e7ca956bb878f8c873e82e65550d67d2f': 'stablePool', // Kovan Metastable
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'managedPool', // Kovan Managed
    '0x6c7f4d97269ece163fd08d5c2584a21e4a33934c': 'boostedPool' // kovan stablephantom
  },
  Stakable: {
    AllowList: [
      '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e370001000000000000000003e3',
      '0xdc2ecfdf2688f92c85064be0b929693acc6dbca6000200000000000000000701',
      '0x647c1fd457b95b75d0972ff08fe01d7d7bda05df000200000000000000000001',
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8'
    ]
  }
};

const POOLS_MAINNET: Pools = {
  IdsMap: {
    staBAL:
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
    bbAaveUSD:
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
    'B-80BAL-20WETH':
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'
  },
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: []
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear', 'ERC4626Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063', // staBAL3 (DAI-USD-USDC)
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066', // WBTC-renBTC-sBTC
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e', // PAR-sEUR-EURS
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080', // Lido Metastable
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112', // Rocket Pool Metastable
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // Mainnet bb-a-USD
      '0x851523a36690bf267bbfec389c823072d82921a90002000000000000000001ed' // wstETH/WETH #2
    ]
  },
  Investment: {
    AllowList: [
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2' // WSB-DEFI mainnet
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool' // mainnet stablephantom
  },
  Stakable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0x072f14b85add63488ddad88f855fda4a99d6ac9b000200000000000000000027',
      '0x0b09dea16768f0799065c475be02919503cb2a3500020000000000000000001a',
      '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000013',
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112',
      '0x27c9f71cc31464b906e0006d4fcbc8900f48f15f00020000000000000000010f',
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
      '0x350196326aeaa9b98f1903fb5e8fc2686f85318c000200000000000000000084',
      '0x3e5fa9518ea95c3e533eb377c001702a9aacaa32000200000000000000000052',
      '0x4bd6d86debdb9f5413e631ad386c4427dc9d01b20002000000000000000000ec',
      '0x51735bdfbfe3fc13dea8dc6502e2e958989429610002000000000000000000a0',
      '0x5d66fff62c17d841935b60df5f07f6cf79bd0f4700020000000000000000014c',
      '0x5f7fa48d765053f8dd85e052843e12d23e3d7bc50002000000000000000000c0',
      '0x702605f43471183158938c1a3e5f5a359d7b31ba00020000000000000000009f',
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
      '0x7edde0cb05ed19e03a9a47cd5e53fc57fde1c80c0002000000000000000000c8',
      '0x8f4205e1604133d1875a3e771ae7e4f2b086563900020000000000000000010e',
      '0x90291319f1d4ea3ad4db0dd8fe9e12baf749e84500020000000000000000013c',
      '0x96646936b91d6b9d7d0c47c496afbf3d6ec7b6f8000200000000000000000019',
      '0x96ba9025311e2f47b840a1f68ed57a3df1ea8747000200000000000000000160',
      '0xa02e4b3d18d4e6b8d18ac421fbc3dfff8933c40a00020000000000000000004b',
      '0xa6f548df93de924d73be7d25dc02554c6bd66db500020000000000000000000e',
      '0xbaeec99c90e3420ec6c1e7a769d2a856d2898e4d00020000000000000000008a',
      '0xbf96189eee9357a95c7719f4f5047f76bde804e5000200000000000000000087',
      '0xe2469f47ab58cf9cf59f9822e3c5de4950a41c49000200000000000000000089',
      '0xe99481dc77691d8e2456e5f3f61c1810adfc1503000200000000000000000018',
      '0xec60a5fef79a92c741cb74fdd6bfc340c0279b01000200000000000000000015',
      '0xedf085f65b4f6c155e13155502ef925c9a756003000200000000000000000123',
      '0xefaa1604e82e1b3af8430b90192c1b9e8197e377000200000000000000000021',
      '0xf4c0dd9b82da36c07605df83c8a416f11724d88b000200000000000000000026',
      '0xf5aaf7ee8c39b651cebf5f1f50c10631e78e0ef9000200000000000000000069',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x92762b42a06dcdddc5b7362cfb01e631c4d44b40000200000000000000000182',
      '0xde8c195aa41c11a0c4787372defbbddaa31306d2000200000000000000000181',
      '0x17ddd9646a69c9445cd8a9f921d4cd93bf50d108000200000000000000000159',
      '0xc45d42f801105e861e86658648e3678ad7aa70f900010000000000000000011e',
      '0x2d344a84bac123660b021eebe4eb6f12ba25fe8600020000000000000000018a',
      '0xb460daa847c45f1c4a41cb05bfb3b51c92e41b36000200000000000000000194',
      '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7000200000000000000000163',
      '0x851523a36690bf267bbfec389c823072d82921a90002000000000000000001ed',
      '0xe8cc7e765647625b95f59c15848379d10b9ab4af0002000000000000000001de',
      '0x85370d9e3bb111391cc89f6de344e801760461830002000000000000000001ef'
    ]
  }
};

const POOLS_POLYGON: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: []
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear', 'ERC4626Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012', // polygon MAI/DAI/USDC/USDT
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e', // polygon WBTC/renBTC
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b', // polygon,
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068', // tusd polygon
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b', // dusd polygon
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366', // polygon staked matic
      '0xb4670d1389c758e4380c4211bcbc85342688b9c50002000000000000000003d8', // vQi,
      '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455', // 4pool
      '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4' // maticx metastable
    ]
  },
  Investment: {
    AllowList: ['']
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'stablePool', // Metastable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // LBP
    '0x41b953164995c11c81da73d212ed8af25741b7ac': 'liquidityBootstrappingPool', // LBP (zero protocol fee)
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool' // polygon stablephantom
  },
  Stakable: {
    AllowList: [
      '0x0297e37f1873d2dab4487aa67cd56b58e2f27875000100000000000000000002',
      '0x03cd191f589d12b0582a99808cf19851e468e6b500010000000000000000000a',
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
      '0x10f21c9bd8128a29aa785ab2de0d044dcdd79436000200000000000000000059',
      '0x186084ff790c65088ba694df11758fae4943ee9e000200000000000000000032',
      '0x36128d5436d2d70cab39c9af9cce146c38554ff0000100000000000000000008',
      '0x5a6ae1fd70d04ba4a279fc219dfabc53825cb01d00020000000000000000020e',
      '0x614b5038611729ed49e0ded154d8a5d3af9d1d9e00010000000000000000001d',
      '0x7c9cf12d783821d5c63d8e9427af5c44bad92445000100000000000000000051',
      '0x805ca3ccc61cc231851dee2da6aabff0a7714aa7000200000000000000000361',
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
      '0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe',
      '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455',
      '0xce66904b68f1f070332cbc631de7ee98b650b499000100000000000000000009',
      '0xcf354603a9aebd2ff9f33e1b04246d8ea204ae9500020000000000000000005a',
      '0xdb1db6e248d7bb4175f6e5a382d0a03fe3dcc813000100000000000000000035',
      '0xea4e073c8ac859f2994c07e627178719c8002dc00002000000000000000003dc',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e',
      '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4'
    ]
  }
};

const POOLS_ARBITRUM: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: []
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear', 'ERC4626Linear'],
  Stable: {
    AllowList: [
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum,
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d', // mai,
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f' // VST
    ]
  },
  Investment: {
    AllowList: ['']
  },
  Factories: {
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool' // arbitrum stablephantom
  },
  Stakable: {
    AllowList: [
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
      '0x0adeb25cb5920d4f7447af4a0428072edc2cee2200020000000000000000004a',
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016',
      '0x1779900c7707885720d39aa741f4086886307e9e00020000000000000000004b',
      '0x4a3a22a3e7fee0ffbb66f1c28bfac50f75546fc7000200000000000000000008',
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
      '0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002',
      '0x651e00ffd5ecfa7f3d4f33d62ede0a97cf62ede2000200000000000000000006',
      '0xb28670b3e7ad27bd41fb5938136bf9e9cba90d6500020000000000000000001e',
      '0xb340b6b1a34019853cb05b2de6ee8ffd0b89a008000100000000000000000036',
      '0xb5b77f1ad2b520df01612399258e7787af63025d000200000000000000000010',
      '0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017',
      '0xc61ff48f94d801c1ceface0289085197b5ec44f000020000000000000000004d',
      '0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001',
      '0xe1b40094f1446722c424c598ac412d590e0b3ffb000200000000000000000076'
    ]
  }
};

const POOLS_GENERIC: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: []
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear', 'ERC4626Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e',
      '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080', // Lido Metastable
      '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112', // Rocket Pool Metastable
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012', // polygon
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e', // polygon
      '0x6b15a01b5d46a5321b627bd7deef1af57bc629070000000000000000000000d4', // kovan
      '0xe08590bde837eb9b2d42aa1196469d6e08fe96ec000200000000000000000101', // kovan
      '0xb4c23af48e79f73e3a7e36c0e54eb38e1ce1755e0002000000000000000000d3', // kovan
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x9f19a375709baf0e8e35c2c5c65aca676c4c7191000200000000000000000022', // polygon PAR/PAR,
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b', // polygon,
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068', // tusd polygon
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum
      '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b', // dusd polygon
      '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe', // Mainnet bb-a-USD
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8', // kovan bb-a-USD,
      '0xd387dfd3a786e7caa06e6cf0c675352c7ffff30400000000000000000000063e', // kovan staBAL3,
      '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366' // staked matic
    ]
  },
  Investment: {
    AllowList: [
      '0x4fd63966879300cafafbb35d157dc5229278ed23000100000000000000000169', // kovan
      '0x37a6fc079cad790e556baedda879358e076ef1b3000100000000000000000348', // WSB Kovan
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2' // WSB-DEFI mainnet
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0x8e9aa87e45e92bad84d5f8dd1bff34fb92637de9': 'weightedPool',
    '0xc66ba2b6595d3613ccab350c886ace23866ede24': 'stablePool',
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x751dfdace1ad995ff13c927f6f761c6604532c79': 'stablePool', // Kovan
    '0x590e544e7ca956bb878f8c873e82e65550d67d2f': 'stablePool', // Kovan Metastable
    // '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'managedPool', // Kovan Managed (clash with mainnet StablePhantom address)
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool', // mainnet stablephantom
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool', // polygon stablephantom
    '0x6c7f4d97269ece163fd08d5c2584a21e4a33934c': 'boostedPool' // kovan stablephantom
  },
  Stakable: {
    AllowList: []
  }
};

const POOLS_MAP = {
  [Network.KOVAN]: POOLS_KOVAN,
  [Network.MAINNET]: POOLS_MAINNET,
  [Network.POLYGON]: POOLS_POLYGON,
  [Network.ARBITRUM]: POOLS_ARBITRUM
};
export const POOLS: Pools = POOLS_MAP[networkId.value]
  ? POOLS_MAP[networkId.value]
  : POOLS_GENERIC;
