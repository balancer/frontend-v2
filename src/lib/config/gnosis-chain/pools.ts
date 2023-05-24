import { BoostedProtocol } from '@/composables/useBoostedPool';
import { Pools } from '@/types/pools';
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
    AllowList: [],
  },
  Weighted: {
    // Only effective after given timestamp here: usePool.ts#createdAfterTimestamp
    // see useDisabledJoinPool.ts#nonAllowedWeightedPoolAfterTimestamp for logic.
    AllowList: WeightedAllowlist,
  },
  Factories: {
    '0xc128468b7ce63ea702c1f104d55a2566b13d3abd': 'composableStablePool', // ComposableStable V3
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'weightedPool', // WeightedPool V3
    '0x6cad2ea22bfa7f4c14aae92e47f510cd5c509bc7': 'weightedPool', // weighted pool v4
  },
  Stakable: {
    VotingGaugePools: [
      '0x66f33ae36dd80327744207a48122f874634b3ada000100000000000000000013',
      '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012',
      '0xb973ca96a3f0d61045f53255e319aedb6ed49240000200000000000000000011',
      '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010',
    ],
    AllowList: [],
  },
  Metadata: {
    '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010': {
      name: 'Balancer Boosted Agave USD',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Agave],
    },
    '0xb973ca96a3f0d61045f53255e319aedb6ed49240000200000000000000000011': {
      name: 'Balancer Boosted Agave GNO/USD',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Agave],
    },
    '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012': {
      name: 'Balancer Boosted Agave GNO/WETH',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Agave],
    },
    '0x66f33ae36dd80327744207a48122f874634b3ada000100000000000000000013': {
      name: 'Balancer Boosted Agave WETH/WBTC/USD',
      hasIcon: false,
      boosted: true,
      boostedProtocols: [BoostedProtocol.Agave],
    },
  },
  Deep: [
    '0xfedb19ec000d38d92af4b21436870f115db22725000000000000000000000010', // agave stable
    '0x66f33ae36dd80327744207a48122f874634b3ada000100000000000000000013', // agave tricrypto
    '0xb973ca96a3f0d61045f53255e319aedb6ed49240000200000000000000000011', // agave gno/usdc
    '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000200000000000000000012', // agave gno/weth
  ],
  BoostedApr: [],
  DisabledJoins: [],
};

export default pools;
