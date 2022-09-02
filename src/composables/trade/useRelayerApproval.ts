import { Vault__factory } from '@balancer-labs/typechain';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { configService } from '@/services/config/config.service';
import { GP_RELAYER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import useRelayerApprovalQuery from '../queries/useRelayerApprovalQuery';
import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

const vaultAddress = configService.network.addresses.vault;

export enum Relayer {
  GNOSIS = 'Gnosis',
  LIDO = 'Lido',
  BATCH = 'Batch',
}

const relayerAddressMap = {
  [Relayer.GNOSIS]: GP_RELAYER_CONTRACT_ADDRESS,
  [Relayer.LIDO]: configService.network.addresses.lidoRelayer,
  [Relayer.BATCH]: configService.network.addresses.batchRelayer,
};

export default function useRelayerApproval(
  relayer: Relayer,
  isEnabled: Ref<boolean> = ref(true)
) {
  /**
   * STATE
   */
  const init = ref(false);
  const approving = ref(false);
  const approved = ref(false);

  /**
   * COMPOSABLES
   */
  const { getSigner, account } = useWeb3();
  const relayerAddress = ref(relayerAddressMap[relayer]);
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();
  const relayerApproval = useRelayerApprovalQuery(relayerAddress);

  /**
   * COMPUTED
   */
  const isUnlocked = computed(
    () =>
      approved.value || (!isEnabled.value ? true : !!relayerApproval.data.value)
  );

  const loading = computed(
    (): boolean =>
      relayerApproval.isLoading.value ||
      relayerApproval.isError.value ||
      relayerApproval.isIdle.value
  );

  const action = computed(
    (): TransactionActionInfo => ({
      label: t('approveBatchRelayer'),
      loadingLabel: t('checkWallet'),
      confirmingLabel: t('approvingBatchRelayer'),
      stepTooltip: t('approveBatchRelayerTooltip'),
      action: approve,
    })
  );

  /**
   * METHODS
   */
  async function approve(): Promise<TransactionResponse> {
    try {
      init.value = true;

      const txBuilder = new TransactionBuilder(getSigner());
      const tx = await txBuilder.contract.sendTransaction({
        contractAddress: configService.network.addresses.vault,
        abi: Vault__factory.abi,
        action: 'setRelayerApproval',
        params: [account.value, relayerAddress.value, true],
      });

      init.value = false;
      approving.value = true;

      handleTransaction(tx);
      return tx;
    } catch (e) {
      console.log(e);
      init.value = false;
      approving.value = false;
      return Promise.reject(e);
    }
  }

  async function handleTransaction(tx): Promise<void> {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: t('transactionSummary.approveRelayer', [relayer]),
      details: {
        contractAddress: vaultAddress,
        spender: relayerAddress.value,
      },
    });

    approved.value = await txListener(tx, {
      onTxConfirmed: () => {
        approving.value = false;
        relayerApproval.refetch.value();
      },
      onTxFailed: () => {
        approving.value = false;
      },
    });
  }

  return {
    action,
    init,
    approve,
    approving,
    approved,
    isUnlocked,
    loading,
  };
}
