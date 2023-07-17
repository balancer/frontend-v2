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
  veDelegationProxy: '0x9dA18982a33FD0c7051B19F0d7C76F2d5E7e017c',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeWorkingBalanceHelper: optimism.ChildChainGaugeWorkingBalanceHelper,
};

export default contracts;
