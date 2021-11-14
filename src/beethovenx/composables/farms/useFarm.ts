import { ref, Ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';
import { MaxUint256 } from '@ethersproject/constants';
import { bnum } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { masterChefContractsService } from '@/beethovenx/services/farm/master-chef-contracts.service';
import { DecoratedPoolWithRequiredFarm } from '@/beethovenx/services/subgraph/subgraph-types';
import useTransactions from '@/composables/useTransactions';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string,
  amount: string
): Promise<TransactionResponse> {
  return sendTransaction(web3, token, abi, 'approve', [spender, amount]);
}

export default function useFarm(
  pool: Ref<DecoratedPoolWithRequiredFarm> | Ref<undefined>
) {
  const { getProvider, appNetworkConfig, account } = useWeb3();
  const { addTransaction } = useTransactions();
  const tokenAddress = pool.value?.farm.pair || '';
  const farmId = pool.value?.farm.id || '';

  async function requiresApproval(
    amount: Ref<string> = ref(MaxUint256.toString())
  ) {
    const allowance = await erc20ContractService.erc20.allowance(
      tokenAddress,
      account.value,
      appNetworkConfig.addresses.masterChef
    );

    if (!amount || bnum(amount.value).eq(0)) return false;

    return allowance.lt(amount.value);
  }

  async function approve() {
    try {
      const provider = getProvider();
      const tx = await erc20ContractService.erc20.approveToken(
        provider,
        appNetworkConfig.addresses.masterChef,
        tokenAddress
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approve LP token`,
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function checkAllowanceAndApprove() {
    if (await requiresApproval()) {
      await approve();
    }
  }

  async function deposit(amount: BigNumber) {
    try {
      const provider = getProvider();
      const tx = await masterChefContractsService.masterChef.deposit(
        provider,
        farmId,
        amount.toString(),
        account.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'invest',
        summary: 'Deposit LP tokens into farm',
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function harvest() {
    try {
      const provider = getProvider();
      const tx = await masterChefContractsService.masterChef.harvest(
        provider,
        farmId,
        account.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Harvest farm rewards',
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  async function withdrawAndHarvest(amount: BigNumber) {
    try {
      const provider = getProvider();
      const tx = await masterChefContractsService.masterChef.withdrawAndHarvest(
        provider,
        farmId,
        amount.toString(),
        account.value
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Withdraw LP tokens',
        details: {
          contractAddress: tokenAddress,
          spender: appNetworkConfig.addresses.masterChef
        }
      });

      return tx;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    requiresApproval,
    approve,
    checkAllowanceAndApprove,
    deposit,
    harvest,
    withdrawAndHarvest
  };
}
