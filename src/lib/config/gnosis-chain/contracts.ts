import { Contracts } from '../types';
import * as gnosis from '@/assets/data/contracts/gnosis.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '0x35b50C7955e7D0E8298e043C9F4dCDef737b9f5a',
  multicall: '0xbb6fab6b627947dae0a75808250d8b2652952cb5',
  authorizer: gnosis.Authorizer,
  vault: gnosis.Vault,
  weightedPoolFactory: gnosis.WeightedPoolFactory,
  stablePoolFactory: gnosis.StablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: gnosis.BalancerHelpers,
  batchRelayer: gnosis.BalancerRelayer,
  gaugeFactory: gnosis.ChildChainLiquidityGaugeFactory,
  balancerMinter: gnosis.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '0x7A2535f5fB47b8e44c02Ef5D9990588313fe8F05',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: gnosis.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: gnosis.ChildChainGaugeWorkingBalanceHelper,
  gaugeCheckpointer: gnosis.ChildChainGaugeCheckpointer,
};

export default contracts;
