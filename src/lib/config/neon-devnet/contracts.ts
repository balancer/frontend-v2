import { Contracts } from '../types';
import * as neon_devnet from '@/assets/data/contracts/neon_devnet.json';

const contracts: Contracts = {
  multicall: neon_devnet.MultiCall,
  authorizer: neon_devnet.Authorizer,
  vault: neon_devnet.Vault,
  weightedPoolFactory: neon_devnet.WeightedPoolFactory,
  stablePoolFactory: neon_devnet.ComposableStablePoolFactory,
  balancerHelpers: neon_devnet.BalancerHelpers,
  batchRelayer: neon_devnet.BalancerRelayer,
  merkleRedeem: '',
  merkleOrchard: '',
  merkleOrchardV2: '',
  lidoRelayer: '',
  veBAL: '',
  gaugeController: '',
  gaugeFactory: '',
  balancerMinter: '',
  tokenAdmin: '',
  veDelegationProxy: '',
  veBALHelpers: '',
  feeDistributor: '',
  feeDistributorDeprecated: '',
  faucet: '',
  omniVotingEscrow: '',
};

export default contracts;
