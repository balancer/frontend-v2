import { Network } from '@/lib/config';
import { Pools } from '@/types/pools';
import { TokenListURLMap } from '@/types/TokenList';

export type CommonTokens = {
  nativeAsset: string;
  wNativeAsset: string;
  WETH: string;
  BAL: string;
  bbaUSD?: string;
  bbaUSDv2?: string;
  rETH?: string;
  stETH?: string;
  wstETH?: string;
  stMATIC?: string;
};

export type TokenConstants = {
  Popular: {
    Symbols: string[];
  };
  Addresses: CommonTokens;
  InitialSwapTokens: {
    input: string;
    output: string;
  };
  PriceChainMap?: Record<string, string>;
  DisableInternalBalanceWithdrawals?: string[];
  DoubleApprovalRequired?: string[];
};

export interface Contracts {
  merkleRedeem: string;
  merkleOrchard: string;
  merkleOrchardV2?: string;
  multicall: string;
  authorizer: string;
  vault: string;
  weightedPoolFactory: string;
  stablePoolFactory: string;
  lidoRelayer: string;
  balancerHelpers: string;
  batchRelayer: string;
  veBAL: string;
  gaugeController: string;
  gaugeFactory: string;
  gaugeWorkingBalanceHelper?: string;
  balancerMinter: string;
  tokenAdmin: string;
  veDelegationProxy: string;
  veBALHelpers: string;
  feeDistributor: string;
  feeDistributorDeprecated: string;
  faucet: string;
  gaugeRewardsHelper?: string;
  omniVotingEscrow?: string;
}

export interface RateProviders {
  [tokenAddress: string]: {
    [providerAddress: string]: boolean;
  };
}

export interface Keys {
  infura?: string;
  alchemy?: string;
  graph?: string;
  balancerApi?: string;
}

export interface Config {
  key: string;
  chainId: Network;
  layerZeroChainId?: number; // https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids
  chainName: string;
  name: string;
  shortName: string;
  monorepoName?: string;
  slug: string;
  network: string;
  trustWalletNetwork?: string;
  unknown: boolean;
  visibleInUI: boolean;
  testNetwork: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
  balancerApi?: string;
  poolsUrlV2: string;
  subgraphs: {
    main: string[];
    aave: string;
    gauge: string;
    blocks: string;
  };
  bridgeUrl: string;
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  supportsVeBalSync?: boolean;
  blockTime: number;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  thirdParty: {
    coingecko: {
      nativeAssetId: string;
      platformId: string;
    };
    apyVision?: {
      networkName: string;
    };
  };
  addresses: Contracts;
  pools: Pools;
  tokens: TokenConstants;
  keys: Keys;
  gauges: {
    type: number;
    weight: number;
  };
  tokenlists: TokenListURLMap;
  rateProviders: Record<string, Record<string, boolean>>;
}
