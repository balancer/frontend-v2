import { Contracts } from '../types';
import * as sepolia from '@/assets/data/contracts/sepolia.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '',
  multicall: '0xca11bde05977b3631167028862be2a173976ca11',
  authorizer: sepolia.Authorizer,
  vault: sepolia.Vault,
  weightedPoolFactory: sepolia.WeightedPoolFactory,
  stablePoolFactory: sepolia.ComposableStablePoolFactory,
  lidoRelayer: '',
  balancerHelpers: sepolia.BalancerHelpers,
  batchRelayer: sepolia.BalancerRelayer,
  gaugeFactory: '',
  balancerMinter: sepolia.BalancerMinter,
  gaugeController: sepolia.GaugeController,
  tokenAdmin: sepolia.BalancerTokenAdmin,
  veBAL: sepolia.VotingEscrow,
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  gaugeRewardsHelper: '',
};

export default contracts;
