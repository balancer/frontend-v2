import { Contracts } from '../types';
import * as polygon from '@/assets/data/contracts/polygon.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '0x0F3e0c4218b7b0108a3643cFe9D3ec0d4F57c54e',
  merkleOrchardV2: polygon.MerkleOrchard,
  multicall: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
  authorizer: polygon.Authorizer,
  vault: polygon.Vault,
  weightedPoolFactory: polygon.WeightedPoolFactory,
  stablePoolFactory: '0xc66Ba2B6595D3613CCab350C886aCE23866EDe24',
  weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  rETH: '0x0266F4F08D82372CF0FcbCCc0Ff74309089c74d1',
  stMATIC: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
  stETH: '',
  wstETH: '',
  lidoRelayer: '',
  balancerHelpers: '0x94905e703fead7f0fd0eee355d267ee909784e6d',
  batchRelayer: polygon.BalancerRelayer,
  gaugeFactory: polygon.ChildChainLiquidityGaugeFactory,
  balancerMinter: polygon.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: polygon.ChildChainGaugeRewardHelper,
};

export default contracts;
