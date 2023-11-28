import { Contracts } from '../types';
import * as zkevm from '@/assets/data/contracts/zkevm.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: zkevm.Authorizer,
  vault: zkevm.Vault,
  weightedPoolFactory: zkevm.WeightedPoolFactory,
  stablePoolFactory: zkevm.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: zkevm.BalancerHelpers,
  batchRelayer: zkevm.BalancerRelayer,
  gaugeFactory: '',
  balancerMinter: zkevm.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: '',
  gaugeWorkingBalanceHelper: zkevm.ChildChainGaugeWorkingBalanceHelper,
  gaugeCheckpointer: zkevm.ChildChainGaugeCheckpointer,
};

export default contracts;
