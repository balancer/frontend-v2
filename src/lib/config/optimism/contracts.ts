import { Contracts } from '../types';
import * as optimism from '@/assets/data/contracts/optimism.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  multicall: '0x2dc0e2aa608532da689e89e237df582b783e552c',
  authorizer: '0xFB2ac3989B6AD0e043a8958004484d6BAAb2c6Ab',
  vault: optimism.Vault,
  weightedPoolFactory: optimism.WeightedPoolFactory,
  stablePoolFactory: '0x41B953164995c11C81DA73D212ED8Af25741b7Ac',
  lidoRelayer: '',
  balancerHelpers: optimism.BalancerHelpers,
  batchRelayer: optimism.BalancerRelayer,
  gaugeFactory: optimism.ChildChainLiquidityGaugeFactory,
  balancerMinter: optimism.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '0x9dA18982a33FD0c7051B19F0d7C76F2d5E7e017c',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: optimism.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: optimism.ChildChainGaugeWorkingBalanceHelper,
};

export default contracts;
