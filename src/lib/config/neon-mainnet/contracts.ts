import { Contracts } from '../types';
import * as neon_mainnet from '@/assets/data/contracts/neon_mainnet.json';

const contracts: Contracts = {
  multicall: neon_mainnet.MultiCall,
  authorizer: neon_mainnet.Authorizer,
  vault: neon_mainnet.Vault,
  weightedPoolFactory: neon_mainnet.WeightedPoolFactory,
  stablePoolFactory: neon_mainnet.ComposableStablePoolFactory,
  balancerHelpers: neon_mainnet.BalancerHelpers,
  batchRelayer: neon_mainnet.BalancerRelayer,
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
