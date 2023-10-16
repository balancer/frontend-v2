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
  lidoRelayer: '',
  balancerHelpers: arbitrum.BalancerHelpers,
  batchRelayer: arbitrum.BalancerRelayer,
  gaugeFactory: arbitrum.ChildChainLiquidityGaugeFactory,
  balancerMinter: arbitrum.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '0x81cFAE226343B24BA12EC6521Db2C79E7aeeb310',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: arbitrum.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: arbitrum.ChildChainGaugeWorkingBalanceHelper,
  gaugeCheckpointer: arbitrum.ChildChainGaugeCheckpointer,
};

export default contracts;
