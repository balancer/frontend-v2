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
  weth: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
  stMATIC: '',
  rETH: '',
  stETH: '',
  wstETH: '',
  lidoRelayer: '',
  balancerHelpers: zkevm.BalancerHelpers,
  batchRelayer: zkevm.BalancerRelayer,
  gaugeFactory: '',
  balancerMinter: '',
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: '',
};

export default contracts;
