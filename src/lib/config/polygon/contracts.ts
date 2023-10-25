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
  lidoRelayer: '',
  balancerHelpers: '0x94905e703fead7f0fd0eee355d267ee909784e6d',
  batchRelayer: polygon.BalancerRelayer,
  gaugeFactory: polygon.ChildChainLiquidityGaugeFactory,
  balancerMinter: polygon.L2BalancerPseudoMinter,
  gaugeController: '',
  tokenAdmin: '',
  veBAL: '',
  veDelegationProxy: '0x0f08eEf2C785AA5e7539684aF04755dEC1347b7c',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: polygon.ChildChainGaugeRewardHelper,
  gaugeWorkingBalanceHelper: polygon.ChildChainGaugeWorkingBalanceHelper,
  gaugeCheckpointer: polygon.ChildChainGaugeCheckpointer,
};

export default contracts;
