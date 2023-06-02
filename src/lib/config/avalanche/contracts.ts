import { Contracts } from '../types';
import * as avalanche from '@/assets/data/contracts/avalanche.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '',
  authorizer: avalanche.Authorizer,
  vault: avalanche.Vault,
  weightedPoolFactory: avalanche.WeightedPoolFactory,
  stablePoolFactory: avalanche.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: avalanche.BalancerHelpers,
  batchRelayer: avalanche.BalancerRelayer,
  gaugeFactory: avalanche.ChildChainLiquidityGaugeFactory,
  balancerMinter: avalanche.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: avalanche.ChildChainGaugeRewardHelper,
};

export default contracts;
