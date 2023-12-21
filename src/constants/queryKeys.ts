import { Network } from '@/lib/config/types';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';

import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { NativeAsset, TokenInfo } from '@/types/TokenList';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import { TokenPrices } from '@/composables/queries/useTokenPricesQuery';
import { MerkleOrchardVersion } from '@/services/claim/claim.service';
import { PoolFilterOptions } from '@/types/pools';
export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';
export const CLAIMS_ROOT_KEY = 'claims';
export const QUERY_EXIT_ROOT_KEY = [POOLS_ROOT_KEY, 'query', 'exit'];
export const QUERY_JOIN_ROOT_KEY = [POOLS_ROOT_KEY, 'query', 'join'];

const QUERY_KEYS = {
  Pools: {
    All: (networkId: Ref<Network>, filterOptions: PoolFilterOptions) => [
      POOLS_ROOT_KEY,
      'all',
      {
        networkId,
        filterOptions,
      },
    ],
    User: (
      networkId: Ref<Network>,
      account: Ref<string>,
      gaugeAddresses: Ref<string[]>
    ) => [POOLS_ROOT_KEY, 'user', { networkId, account, gaugeAddresses }],
    Current: (id: string) => [POOLS_ROOT_KEY, 'current', { id }],
    APR: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'apr',
      { networkId, id },
    ],
    Snapshot: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'snapshot',
      { networkId, id },
    ],
    Activities: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'activities',
      'all',
      { networkId, id },
    ],
    UserActivities: (
      networkId: Ref<Network>,
      id: string,
      account: Ref<string>
    ) => [POOLS_ROOT_KEY, 'activities', 'user', { networkId, account, id }],
    Swaps: (
      networkId: Ref<Network>,
      id: string,
      subgraphQuery: Record<string, any>
    ) => [POOLS_ROOT_KEY, 'swaps', { networkId, id, subgraphQuery }],
    UserSwaps: (networkId: Ref<Network>, id: string, account: Ref<string>) => [
      POOLS_ROOT_KEY,
      'swaps',
      'user',
      { networkId, account, id },
    ],
    HistoricalPrices: (networkId: Ref<Network>, id: string) => [
      POOLS_ROOT_KEY,
      'historicalPrices',
      { networkId, id },
    ],
    Joins: {
      QueryJoin: (amountsIn: Ref<unknown>, isSingleAssetJoin: Ref<unknown>) => [
        ...QUERY_JOIN_ROOT_KEY,
        {
          amountsIn,
          isSingleAssetJoin,
        },
      ],
    },
    Exits: {
      QueryExit: (
        account: Ref<string>,
        bptIn: Ref<unknown>,
        isSingleAssetExit: Ref<unknown>,
        singleAmountOut: unknown,
        relayerSignature: Ref<string | undefined>
      ) => [
        ...QUERY_EXIT_ROOT_KEY,
        {
          account,
          bptIn,
          isSingleAssetExit,
          singleAmountOut,
          relayerSignature,
        },
      ],
      SingleAssetMax: (
        bptBalance: Ref<string>,
        isSingleAssetExit: Ref<unknown>,
        singleAmountOut: unknown
      ) => [
        POOLS_ROOT_KEY,
        'singleAssetMax',
        {
          bptBalance,
          isSingleAssetExit,
          singleAmountOut,
        },
      ],
    },
    Gauges: (poolAddresses: Ref<string[] | undefined>) => [
      'pools',
      'gauges',
      { poolAddresses },
    ],
  },
  Pool: {
    Gauges: (poolAddress: Ref<string | undefined>) => [
      'pool',
      'gauges',
      { poolAddress },
    ],
    Decorated: (poolId: Ref<string | undefined>) => [
      'pool',
      'decorated',
      { poolId },
    ],
  },
  User: {
    Pool: {
      StakedShares: (
        userGaugeShares: Ref<GaugeShare[] | undefined>,
        account: Ref<string>
      ) => ['user', 'pool', 'stakedShares', { userGaugeShares, account }],
    },
    Pools: (account: Ref<string>) => ['user', 'pools', { account }],
    Gauges: (account: Ref<string>, poolAddress: Ref<string> | undefined) => [
      'user',
      'gauges',
      { account, poolAddress },
    ],
    Boosts: (
      account: Ref<string>,
      userGaugeShares: Ref<undefined> | Ref<GaugeShare[]>
    ) => ['user', 'boosts', { account, userGaugeShares }],
  },
  TokenLists: {
    All: (networkId: Ref<Network>) => ['tokenLists', 'all', { networkId }],
  },
  Claims: {
    All: (
      networkId: Ref<Network>,
      account: Ref<string>,
      merkleOrchardVersion: MerkleOrchardVersion
    ) => [CLAIMS_ROOT_KEY, { networkId, account, merkleOrchardVersion }],
    Protocol: (networkId: Ref<Network>, account: Ref<string>) => [
      CLAIMS_ROOT_KEY,
      'protocol',
      { networkId, account },
    ],
    GaugePools: (poolIds: Ref<string[]>) => [
      CLAIMS_ROOT_KEY,
      'gaugePools',
      { poolIds },
    ],
  },
  Tokens: {
    PairPriceData: (
      tokenInAddress: Ref<string>,
      tokenOutAddress: Ref<string>,
      activeTimespan: Ref<{ option: string; value: number }>,
      userNetworkId: Ref<number>,
      nativeAsset: NativeAsset,
      wrappedNativeAsset: Ref<TokenInfo>
    ) => [
      'pairPriceData',
      {
        tokenInAddress,
        tokenOutAddress,
        activeTimespan,
        userNetworkId,
        nativeAsset,
        wrappedNativeAsset,
      },
    ],
    Prices: (networkId: Ref<Network>, pricesToInject: Ref<TokenPrices>) => [
      'tokens',
      'prices',
      { networkId, pricesToInject },
    ],
    AllPrices: ['tokens', 'prices'],
    VeBAL: (networkId: Ref<Network>, account: Ref<string>) => [
      'tokens',
      'veBAL',
      { networkId, account },
    ],
  },
  Account: {
    Balances: (
      networkId: Ref<Network>,
      account: Ref<string>,
      tokens: Ref<string[]>
    ) => ['account', 'balances', { networkId, account, tokens }],
    Allowances: (
      networkId: Ref<Network>,
      account: Ref<string>,
      contractAddresses: Ref<string[]>,
      tokens: Ref<string[]>
    ) => [
      'account',
      'allowances',
      { networkId, account, contractAddresses, tokens },
    ],
    RelayerApprovals: (
      networkId: Ref<Network>,
      account: Ref<string>,
      relayer: Ref<string>
    ) => ['account', 'relayer', { networkId, account, relayer }],
    Profile: (
      networkId: Ref<Network>,
      account: Ref<string>,
      chainId: Ref<number | undefined>
    ) => ['account', 'profile', { networkId, account, chainId }],
  },
  Gauges: {
    All: {
      Static: () => ['gauges', 'all', 'static'],
      Onchain: (
        gauges: Ref<SubgraphGauge[] | undefined>,
        account: Ref<string>,
        networkId: Ref<Network>
      ) => ['gauges', 'all', 'onchain', { gauges, account, networkId }],
    },
    Expired: (gauges: Ref<string[] | undefined>, networkId: Ref<Network>) => [
      'gauges',
      'expired',
      { gauges, networkId },
    ],
    VotingEscrowLocks: (lockedAmount?: string) => [
      'votingEscrowLocks',
      lockedAmount,
    ],
    VotingEscrowLocksByNetworkId: (
      networkId: Network,
      account: Ref<string>,
      providedUser: Ref<string | undefined>
    ) => ['votingEscrowLocksByNetworkId', { networkId, account, providedUser }],
    OmniEscrowLocks: (networkId: Ref<Network>, account: Ref<string>) => [
      'omniEscrowLocks',
      { account, networkId },
    ],
    Voting: (account: Ref<string>) => ['gauges', 'voting', { account }],
  },
  Transaction: {
    ConfirmationDate: (receipt: Ref<TransactionReceipt>) => [
      'tx',
      'confirmation',
      'date',
      { receipt },
    ],
  },
  Locks: {
    Historical: (networkId: Ref<Network>, account: Ref<string>) => [
      'historical-locks',
      { networkId, account },
    ],
    UserRank: (networkId: Ref<Network>, account: Ref<string>) => [
      'user-rank',
      { networkId, account },
    ],
  },
};

export default QUERY_KEYS;
