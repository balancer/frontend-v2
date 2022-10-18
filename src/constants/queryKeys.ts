import { Network } from '@balancer-labs/sdk';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { Ref } from 'vue';

import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { NativeAsset, TokenInfo } from '@/types/TokenList';
export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';
export const CLAIMS_ROOT_KEY = 'claims';

const QUERY_KEYS = {
  Pools: {
    All: (
      networkId: Ref<Network>,
      tokens: Ref<string[]>,
      poolIds: Ref<string[]> | undefined,
      poolAddresses: Ref<string[]> | undefined,
      gaugeAddresses: Ref<string[]>
    ) => [
      POOLS_ROOT_KEY,
      'all',
      { networkId, tokens, poolIds, poolAddresses, gaugeAddresses },
    ],
    User: (
      networkId: Ref<Network>,
      account: Ref<string>,
      gaugeAddresses: Ref<string[]>
    ) => [POOLS_ROOT_KEY, 'user', { networkId, account, gaugeAddresses }],
    Current: (id: string, gaugeAddresses: Ref<string[]>) => [
      POOLS_ROOT_KEY,
      'current',
      { id, gaugeAddresses },
    ],
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
  },
  TokenLists: {
    All: (networkId: Ref<Network>) => ['tokenLists', 'all', { networkId }],
  },
  Claims: {
    All: (networkId: Ref<Network>, account: Ref<string>) => [
      CLAIMS_ROOT_KEY,
      { networkId, account },
    ],
    Protocol: (networkId: Ref<Network>, account: Ref<string>) => [
      CLAIMS_ROOT_KEY,
      'protocol',
      { networkId, account },
    ],
  },
  Tokens: {
    TrendingPairs: (userNetworkId: Ref<number>) => [
      'trendingTradePairs',
      { userNetworkId },
    ],
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
    Prices: (
      networkId: Ref<Network>,
      tokens: Ref<string[]>,
      pricesToInject: Ref<TokenPrices>
    ) => ['tokens', 'prices', { networkId, tokens, pricesToInject }],
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
};

export default QUERY_KEYS;
