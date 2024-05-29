import { Contracts } from '../types';
import * as fraxtal from '@/assets/data/contracts/fraxtal.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  // multicall: '0x2dc0e2aa608532da689e89e237df582b783e552c',
  authorizer: fraxtal.Authorizer,
  vault: fraxtal.Vault,
  weightedPoolFactory: fraxtal.WeightedPoolFactory,
  stablePoolFactory: fraxtal.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: fraxtal.BalancerHelpers,
  batchRelayer: fraxtal.BalancerRelayer,
  gaugeFactory: fraxtal.ChildChainGaugeFactory,
  balancerMinter: fraxtal.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: fraxtal.VotingEscrowDelegationProxy,
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeWorkingBalanceHelper: fraxtal.GaugeWorkingBalanceHelper,
};

export default contracts;
