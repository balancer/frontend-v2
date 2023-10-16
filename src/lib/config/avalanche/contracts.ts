import { Contracts } from '../types';
import * as avalanche from '@/assets/data/contracts/avalanche.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
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
  veDelegationProxy: avalanche.VotingEscrowDelegationProxy,
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: avalanche.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: avalanche.ChildChainGaugeWorkingBalanceHelper,
  gaugeCheckpointer: avalanche.ChildChainGaugeCheckpointer,
};

export default contracts;
