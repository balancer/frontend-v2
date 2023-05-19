import { Contracts } from '../types';
import * as arbitrum from '@/assets/data/contracts/arbitrum.json';

const contracts: Contracts = {
  merkleRedeem: '0x6bd0B17713aaa29A2d7c9A39dDc120114f9fD809',
  merkleOrchard: '0x751A0bC0e3f75b38e01Cf25bFCE7fF36DE1C87DE',
  merkleOrchardV2: arbitrum.MerkleOrchard,
  multicall: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
  authorizer: '0x6207ed574152496c9B072C24FD87cE9cd9E17320',
  vault: arbitrum.Vault,
  weightedPoolFactory: arbitrum.WeightedPoolFactory,
  stablePoolFactory: '0x2433477A10FC5d31B9513C638F19eE85CaED53Fd',
  weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  stMATIC: '',
  rETH: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
  stETH: '',
  wstETH: '0x5979d7b546e38e414f7e9822514be443a4800529',
  lidoRelayer: '',
  balancerHelpers: arbitrum.BalancerHelpers,
  batchRelayer: arbitrum.BalancerRelayer,
  gaugeFactory: arbitrum.ChildChainLiquidityGaugeFactory,
  balancerMinter: arbitrum.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: arbitrum.ChildChainGaugeRewardHelper,
};

export default contracts;
