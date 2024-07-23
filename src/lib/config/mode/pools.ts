import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { PoolWarning, Pools } from '@/types/pools';
import { Network } from '../types';
import { Protocol } from '@/composables/useProtocols';

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
  BlockList: [],
  IncludedPoolTypes: [
    'Weighted',
    'Stable',
    'MetaStable',
    'GyroE',
    'ComposableStable',
  ],
  Stable: {
    AllowList: [],
  },
  Investment: {
    AllowList: [],
  },
  Weighted: {
    AllowList: [],
  },
  Factories: {
    '0x5dbad78818d4c8958eff2d5b95b28385a22113cd': 'composableStablePool',
    '0xc3ccace87f6d3a81724075adcb5ddd85a8a1bb68': 'weightedPool',
  },
  Stakable: {
    VotingGaugePools: [],
    AllowList: [],
  },
  Deep: [],
  BoostedApr: [],
  Metadata: {
    '0xcf376bc82686be7f88fa8936c18c62a2f11c4003000200000000000000000009': {
      points: [
        {
          protocol: Protocol.Superfest,
          multiple: '',
          url: 'https://jumper.exchange/superfest',
          description:
            'To find out more about Superfest, visit <a href="https://jumper.exchange/superfest" target="_blank" rel="noopener noreferrer">jumper.exchange/superfest</a>',
        },
      ],
    },
  },
  DisabledJoins: [],
  BrandedRedirect: {
    Gyro2: 'gyro',
    Gyro3: 'gyro',
    GyroE: 'gyro',
  },
  Issues: {
    [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.MODE],
  },
};

export default pools;
