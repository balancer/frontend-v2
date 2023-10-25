import { Contracts } from '../types';
import * as mainnet from '@/assets/data/contracts/mainnet.json';

const contracts: Contracts = {
  merkleRedeem: '0x6d19b2bF3A36A61530909Ae65445a906D98A2Fa8',
  merkleOrchard: '0xdAE7e32ADc5d490a43cCba1f0c736033F2b4eFca',
  merkleOrchardV2: mainnet.MerkleOrchard,
  multicall: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  authorizer: mainnet.Authorizer,
  vault: mainnet.Vault,
  weightedPoolFactory: mainnet.WeightedPoolFactory,
  stablePoolFactory: '0xc66Ba2B6595D3613CCab350C886aCE23866EDe24',
  lidoRelayer: mainnet.LidoRelayer,
  balancerHelpers: mainnet.BalancerHelpers,
  batchRelayer: mainnet.BalancerRelayer,
  veBAL: mainnet.VotingEscrow,
  gaugeController: mainnet.GaugeController,
  gaugeFactory: '0x4E7bBd911cf1EFa442BC1b2e9Ea01ffE785412EC',
  balancerMinter: mainnet.BalancerMinter,
  tokenAdmin: mainnet.BalancerTokenAdmin,
  veDelegationProxy: mainnet.VotingEscrowDelegationProxy,
  veBALHelpers: '0x8e5698dc4897dc12243c8642e77b4f21349db97c',
  feeDistributor: mainnet.FeeDistributor,
  feeDistributorDeprecated: '0x26743984e3357eFC59f2fd6C1aFDC310335a61c9',
  faucet: '',
  omniVotingEscrow: '0x96484f2aBF5e58b15176dbF1A799627B53F13B6d',
  claimSubmission: '0x70b55Af71B29c5Ca7e67bD1995250364C4bE5554',
};

export default contracts;
