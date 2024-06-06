import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { PoolWarning, Pools } from '@/types/pools';
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
  Metadata: {},
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
