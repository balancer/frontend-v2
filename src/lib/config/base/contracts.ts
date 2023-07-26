import { Contracts } from '../types';
import * as base from '@/assets/data/contracts/base.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: base.MerkleOrchard,
  multicall: '',
  authorizer: '',
  vault: base.Vault,
  weightedPoolFactory: base.WeightedPoolFactory,
  stablePoolFactory: '',
  lidoRelayer: '',
  balancerHelpers: base.BalancerHelpers,
  batchRelayer: base.BalancerRelayer,
  gaugeFactory: base.ChildChainLiquidityGaugeFactory,
  balancerMinter: base.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: base.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: base.ChildChainGaugeWorkingBalanceHelper,
};

export default contracts;
