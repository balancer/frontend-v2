import { Contracts } from '../types';
import * as base from '@/assets/data/contracts/base.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: base.MerkleOrchard,
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
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
  veDelegationProxy: base.VotingEscrowDelegationProxy,
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: base.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: base.ChildChainGaugeWorkingBalanceHelper,
  gaugeCheckpointer: base.ChildChainGaugeCheckpointer,
};

export default contracts;
