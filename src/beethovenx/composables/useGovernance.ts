import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber, utils } from 'ethers';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import { bn } from '@/beethovenx/utils/numbers';

export function useGovernance() {
  const { account, getProvider } = useWeb3();

  async function fBeetsTotalSupply() {
    return utils.formatUnits(
      await governanceContractsService.fbeets.getTotalFreshBeetsSupply()
    );
  }

  async function fBeetsBalance() {
    return utils.formatUnits(
      await governanceContractsService.fbeets.fBeetsBalanceOf(account.value)
    );
  }

  async function totalVestedTokenAmount() {
    console.log('fetching total vested amount');
    return utils.formatUnits(
      await governanceContractsService.fbeets.getTotalVestedTokenAmount()
    );
  }

  async function approveVestingToken(amount?: BigNumber) {
    await erc20ContractService.erc20.approveToken(
      getProvider(),
      governanceContractsService.fbeets.fbeetsAddress,
      governanceContractsService.fbeets.vestingTokenAddress,
      amount?.toString()
    );
  }

  async function enter(amount: BigNumber) {
    return governanceContractsService.fbeets.enter(getProvider(), amount);
  }

  async function leave(amount: BigNumber) {
    return governanceContractsService.fbeets.leave(getProvider(), amount);
  }

  async function exchangeRate() {
    const totalFBeetsSupply = await governanceContractsService.fbeets.getTotalFreshBeetsSupply();
    const totalVestedTokens = await governanceContractsService.fbeets.getTotalVestedTokenAmount();

    if (totalFBeetsSupply.eq(bn(0))) {
      return '0';
    }

    return totalVestedTokens.div(totalFBeetsSupply).toString();
  }

  // returns the amount you would get if you traded back fBeets => vesting token
  async function exchangeAmount() {
    const totalFBeetsSupply = await governanceContractsService.fbeets.getTotalFreshBeetsSupply();
    const totalVestedTokens = await governanceContractsService.fbeets.getTotalVestedTokenAmount();
    const fBeetsBalance = await governanceContractsService.fbeets.fBeetsBalanceOf(
      account.value
    );

    if (totalFBeetsSupply.eq(bn(0))) {
      return '0';
    }

    return utils.formatUnits(
      fBeetsBalance.mul(totalVestedTokens).div(totalFBeetsSupply)
    );
  }

  return {
    approveVestingToken,
    fBeetsTotalSupply,
    fBeetsBalance,
    totalVestedTokenAmount,
    enter,
    leave,
    exchangeAmount,
    exchangeRate
  };
}
