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
  IncludedPoolTypes: ['Weighted', 'Stable', 'MetaStable'],
  Stable: {
    AllowList: [],
  },
  Investment: {
    AllowList: [''],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: [
      '0xe4a4565ad31a3af8286bc6e6dbb20ba76752557700010000000000000000000b',
      '0xbf7a12046f7f5a9403fe2f75e1e5c531da3cf55300020000000000000000000c',
    ],
  },
  Factories: {},
  Stakable: {
    VotingGaugePools: [],
    AllowList: [],
  },
  Metadata: {},
  Deep: [],
  BoostedApr: [],
  DisabledJoins: [],
  Deprecated: {},
  GaugeMigration: {},
  BrandedRedirect: {},
  Issues: {},
};

export default pools;
