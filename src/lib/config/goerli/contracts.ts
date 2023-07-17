import { Contracts } from '../types';
import * as goerli from '@/assets/data/contracts/goerli.json';

const contracts: Contracts = {
  merkleRedeem: '',
  merkleOrchard: '0x35b50C7955e7D0E8298e043C9F4dCDef737b9f5a',
  multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  authorizer: goerli.Authorizer,
  vault: goerli.Vault,
  weightedPoolFactory: goerli.WeightedPoolFactory,
  stablePoolFactory: '0x44afeb87c871D8fEA9398a026DeA2BD3A13F5769',
  lidoRelayer: goerli.LidoRelayer,
  balancerHelpers: goerli.BalancerHelpers,
  batchRelayer: goerli.BalancerRelayer,
  gaugeFactory: '0x224E808FBD9e491Be8988B8A0451FBF777C81B8A',
  balancerMinter: goerli.BalancerMinter,
  gaugeController: goerli.GaugeController,
  tokenAdmin: goerli.BalancerTokenAdmin,
  veBAL: goerli.VotingEscrow,
  veDelegationProxy: '0xA1F107D1cD709514AE8A914eCB757E95f9cedB31',
  veBALHelpers: '0xE9aac58a051314C085773668f27DD6F673fc0B3F',
  feeDistributor: '0x7F91dcdE02F72b478Dc73cB21730cAcA907c8c44',
  feeDistributorDeprecated: '0x7F91dcdE02F72b478Dc73cB21730cAcA907c8c44',
  faucet: '0xccb0F4Cf5D3F97f4a55bb5f5cA321C3ED033f244',
  gaugeRewardsHelper: goerli.ChildChainGaugeRewardHelper,
  omniVotingEscrow: '0x96484f2aBF5e58b15176dbF1A799627B53F13B6d',
};

export default contracts;
