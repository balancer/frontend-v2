import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { PoolWarning, Pools, RiskKey } from '@/types/pools';
import { Network } from '../types';
import { Protocol } from '@/composables/useProtocols';

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
    'Gyro2',
    'Gyro3',
    'GyroE',
  ],
  Stable: {
    AllowList: [
      '0xe1f2c039a68a216de6dd427be6c60decf405762a00000000000000000000000e',
      '0xe274c9deb6ed34cfe4130f8d0a8a948dea5bb28600000000000000000000000d',
      '0xdf725fde6e89981fb30d9bf999841ac2c160b512000000000000000000000010',
      '0x1d0a8a31cdb04efac3153237526fb15cc65a252000000000000000000000000f',
      '0x6f34a44fce1506352a171232163e7716dd073ade000200000000000000000015',
      '0x9e2d87f904862671eb49cb358e74284762cc9f42000200000000000000000013',
      '0x65da876a95cd5b6a5880710628c436409b1b29fa00000000000000000000005b',
      '0x4e406fa1676fc1de63bbdb241dccf3c10b55c65a00000000000000000000005a',
      '0xffc865fcb34e754fad4b0144139b9c28c81c3eff00000000000000000000005f',
    ],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    // Deprecated list, no longer in use
    AllowList: [
      '0x5480b5f610fa0e11e66b42b977e06703c07bc5cf000200000000000000000008',
      '0xa7f602cfaf75a566cb0ed110993ee81c27fa3f53000200000000000000000009',
      '0x195def5dabc4a73c4a6a410554f4e53f3e55f1a900010000000000000000000a',
      '0x68a69c596b3839023c0e08d09682314f582314e5000200000000000000000011',
      '0x9e2d87f904862671eb49cb358e74284762cc9f42000200000000000000000013',
      '0x6f34a44fce1506352a171232163e7716dd073ade000200000000000000000015',
      '0xf74d0c533012e372a465712b49a26199a1b0714c000200000000000000000038',
      '0xc951aebfa361e9d0063355b9e68f5fa4599aa3d1000100000000000000000017',
      '0xa4475aa0a6971e3cc82de08e9ce432ecc8a562ad000200000000000000000029',
      '0x5b125477cd532b892c3a6b206014c6c9518a0afe000200000000000000000018',
      '0x7da2bb31cb168be60025f9122a95cbb3949e7e9e000200000000000000000016',
      '0x47eeb5e07b8db37f75f29422d90a2b729c8f395500020000000000000000001e',
      '0xffb847598207ec5d3f0c8d256c061e1d664db2d3000200000000000000000061',
      '0x4ced3133e70f6ed17f085170806e68cd12447b09000200000000000000000065',
    ],
  },
  Factories: {
    '0x03f3fb107e74f2eac9358862e91ad3c692712054': 'weightedPool', // Weighted v4
    '0x8ea89804145c007e7d226001a96955ad53836087': 'composableStablePool', // ComposableStable V4
    '0x956ccab09898c0af2aca5e6c229c3ad4e93d9288': 'composableStablePool',
    '0x6b1da720be2d11d95177ccfc40a917c2688f396c': 'erc4626Linear', // ERC4626 LinearPool
    '0x5d56ea1b2595d2dbe4f5014b967c78ce75324f0c': 'gyroE',
    '0x577e5993b9cc480f07f98b5ebd055604bd9071c4': 'composableStablePool',
  },
  Stakable: {
    VotingGaugePools: [
      '0x1d0a8a31cdb04efac3153237526fb15cc65a252000000000000000000000000f',
      '0xe1f2c039a68a216de6dd427be6c60decf405762a00000000000000000000000e',
      '0xe274c9deb6ed34cfe4130f8d0a8a948dea5bb28600000000000000000000000d',
      '0xdf725fde6e89981fb30d9bf999841ac2c160b512000000000000000000000010',
      '0x9e2d87f904862671eb49cb358e74284762cc9f42000200000000000000000013',
      '0x6f34a44fce1506352a171232163e7716dd073ade000200000000000000000015',
      '0xb1557cfea06de5a1601a7f0ccf3b515ef431a50d000200000000000000000059',
      '0x65da876a95cd5b6a5880710628c436409b1b29fa00000000000000000000005b',
      '0xffc865fcb34e754fad4b0144139b9c28c81c3eff00000000000000000000005f',
      '0x9f826c576b1f821df31ca6d58c9443db25a81d65000200000000000000000064',
      '0xe58cd0c79cdff6252476b3445bee1400503e0ae0000200000000000000000066',
      '0xd4ec150896f1784b5be2b3af460d2cb2b8c0f522000200000000000000000069',
      '0xf596ac9c9b60f9c555b8290c2b039c275396afb4000200000000000000000068',
    ],
    AllowList: [
      '0x195def5dabc4a73c4a6a410554f4e53f3e55f1a900010000000000000000000a',
      '0x1d0a8a31cdb04efac3153237526fb15cc65a252000000000000000000000000f',
      '0xe1f2c039a68a216de6dd427be6c60decf405762a00000000000000000000000e',
      '0x68a69c596b3839023c0e08d09682314f582314e5000200000000000000000011',
      '0xe274c9deb6ed34cfe4130f8d0a8a948dea5bb28600000000000000000000000d',
      '0xdf725fde6e89981fb30d9bf999841ac2c160b512000000000000000000000010',
      '0x9e2d87f904862671eb49cb358e74284762cc9f42000200000000000000000013',
      '0x6f34a44fce1506352a171232163e7716dd073ade000200000000000000000015',
      '0xffc865fcb34e754fad4b0144139b9c28c81c3eff00000000000000000000005f',
      '0xa4475aa0a6971e3cc82de08e9ce432ecc8a562ad000200000000000000000029',
    ],
  },
  Metadata: {
    '0xf596ac9c9b60f9c555b8290c2b039c275396afb4000200000000000000000068': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '5',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
    '0xd4ec150896f1784b5be2b3af460d2cb2b8c0f522000200000000000000000069': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '5',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
    '0xe58cd0c79cdff6252476b3445bee1400503e0ae0000200000000000000000066': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '1',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
    '0x9f826c576b1f821df31ca6d58c9443db25a81d65000200000000000000000064': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '1',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
  },
  Deep: [
    '0x68a69c596b3839023c0e08d09682314f582314e5000200000000000000000011',
    '0xe274c9deb6ed34cfe4130f8d0a8a948dea5bb28600000000000000000000000d',
    '0x9e2d87f904862671eb49cb358e74284762cc9f42000200000000000000000013',
    '0x6f34a44fce1506352a171232163e7716dd073ade000200000000000000000015',
  ],
  Deprecated: {},
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [...CSP_ISSUE_POOL_IDS[Network.ZKEVM]],
  Risks: {
    '0x1d0a8a31cdb04efac3153237526fb15cc65a252000000000000000000000000f': [
      RiskKey.RateProviderBridge,
    ],
    '0xe1f2c039a68a216de6dd427be6c60decf405762a00000000000000000000000e': [
      RiskKey.RateProviderBridge,
    ],
    '0xdf725fde6e89981fb30d9bf999841ac2c160b512000000000000000000000010': [
      RiskKey.RateProviderBridge,
    ],
    '0x6f34a44fce1506352a171232163e7716dd073ade000200000000000000000015': [
      RiskKey.RateProviderBridge,
    ],
    '0x68a69c596b3839023c0e08d09682314f582314e5000200000000000000000011': [
      RiskKey.RateProviderBridge,
    ],
  },
  Issues: {
    [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.ZKEVM],
  },
  BrandedRedirect: {
    FX: 'xave',
    Gyro2: 'gyro',
    Gyro3: 'gyro',
    GyroE: 'gyro',
  },
};

export default pools;
