import { Contracts } from '../types';
import * as gnosis from '@/assets/data/contracts/gnosis.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '0x35b50C7955e7D0E8298e043C9F4dCDef737b9f5a',
  multicall: '0xbb6fab6b627947dae0a75808250d8b2652952cb5',
  authorizer: gnosis.Authorizer,
  vault: gnosis.Vault,
  weightedPoolFactory: gnosis.WeightedPoolFactory,
  stablePoolFactory: gnosis.StablePoolFactory,
  weth: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
  rETH: '',
  stMATIC: '',
  stETH: '',
  wstETH: '',
  lidoRelayer: '',
  balancerHelpers: gnosis.BalancerHelpers,
  batchRelayer: gnosis.BalancerRelayer,
  gaugeFactory: gnosis.ChildChainLiquidityGaugeFactory,
  balancerMinter: gnosis.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: gnosis.ChildChainGaugeRewardHelper,
};

export default contracts;
