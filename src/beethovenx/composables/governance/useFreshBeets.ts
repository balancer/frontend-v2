import useWeb3 from '@/services/web3/useWeb3';
import { BigNumber, utils } from 'ethers';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import { bn } from '@/beethovenx/utils/numbers';
import useFreshBeetsQuery from '@/beethovenx/composables/governance/useFreshBeetsQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';

export function useFreshBeets() {
  const { account, getProvider } = useWeb3();
  const freshBeetsQuery = useFreshBeetsQuery();
  const { addTransaction } = useTransactions();
  const { isLoading, isIdle, data } = freshBeetsQuery;

  const fBeetsLoading = computed(() => isLoading.value || isIdle.value);

  const totalSupply = computed(() => data.value?.totalSupply ?? bn(0));
  const totalVestedAmount = computed(
    () => data.value?.totalVestedAmount ?? bn(0)
  );
  const userFbeetsBalance = computed(() => data.value?.userBalance ?? bn(0));
  const userBptTokenBalance = computed(
    () => data.value?.userBptTokenBalance ?? bn(0)
  );
  const userAllowance = computed(() => data.value?.allowance ?? bn(0));
  const currentExchangeRate = computed(() =>
    totalSupply.value.eq(0)
      ? bn(0)
      : totalVestedAmount.value.div(totalSupply.value)
  );

  const totalSupplyIsZero = computed(() => totalSupply.value.eq(bn(0)) ?? true);

  const exchangeRate = computed(() =>
    !data.value || totalSupplyIsZero.value
      ? '0'
      : userBptTokenBalance.value.div(totalSupply.value).toString()
  );

  const userExchangeAmount = computed(() =>
    !data.value || totalSupplyIsZero.value
      ? '0'
      : utils.formatUnits(
          userFbeetsBalance.value
            .mul(userBptTokenBalance.value)
            .div(totalSupply.value)
        )
  );

  async function approve(amount?: string) {
    const tx = await erc20ContractService.erc20.approveToken(
      getProvider(),
      governanceContractsService.fbeets.fbeetsAddress,
      governanceContractsService.fbeets.vestingTokenAddress,
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve LP token`,
      details: {
        contractAddress: governanceContractsService.fbeets.vestingTokenAddress,
        spender: governanceContractsService.fbeets.fbeetsAddress
      }
    });

    return tx;
  }

  async function stake(amount: string) {
    const tx = await governanceContractsService.fbeets.enter(
      getProvider(),
      BigNumber.from(amount)
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Stake LP tokens for fBEETS',
      details: {
        contractAddress: governanceContractsService.fbeets.vestingTokenAddress,
        spender: governanceContractsService.fbeets.fbeetsAddress
      }
    });

    return tx;
  }

  async function unStake(amount: string) {
    const tx = await governanceContractsService.fbeets.leave(
      getProvider(),
      BigNumber.from(amount)
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Burn fBEETS and withdraw LP tokens',
      details: {
        contractAddress: governanceContractsService.fbeets.vestingTokenAddress,
        spender: governanceContractsService.fbeets.fbeetsAddress
      }
    });

    return tx;
  }

  return {
    fBeetsLoading,
    exchangeRate,
    totalSupply,
    userFbeetsBalance,
    userBptTokenBalance,
    userAllowance,
    userExchangeAmount,
    freshBeetsQuery,
    currentExchangeRate,

    approve,
    stake,
    unStake
  };
}
