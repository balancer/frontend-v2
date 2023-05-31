import { Contracts } from '../types';
import * as optimism from '@/assets/data/contracts/optimism.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  multicall: '',
  authorizer: '',
  vault: '',
  weightedPoolFactory: optimism.WeightedPoolFactory,
  stablePoolFactory: '',
  lidoRelayer: '',
  balancerHelpers: '',
  batchRelayer: optimism.BalancerRelayer,
  gaugeFactory: '',
  balancerMinter: optimism.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
};

export default contracts;
