import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useWeb3 from '@/services/web3/useWeb3';

import useTransactions from '../useTransactions';
import useEthers from '../useEthers';
import { configService } from '@/services/config/config.service';

import vaultAbi from '@/lib/abi/Vault.json';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import useBatchRelayerApprovalQuery from '../queries/useBatchRelayerApprovalQuery';

const batchRelayerAddress = configService.network.addresses.batchRelayer;
const vaultAddress = configService.network.addresses.vault;

export default function useBatchRelayerApproval(isStETHTrade: Ref<boolean>) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approved = ref(false);

  /**
   * COMPOSABLES
   */
  const { getProvider, account } = useWeb3();

  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();
  const batchRelayerApproval = useBatchRelayerApprovalQuery(isStETHTrade);

  /**
   * COMPUTED
   */

  const isUnlocked = computed(() =>
    approved.value || !isStETHTrade.value
      ? true
      : !!batchRelayerApproval.data.value
  );

  /**
   * METHODS
   */
  async function approve(): Promise<void> {
    approving.value = true;
    try {
      const tx = await sendTransaction(
        getProvider(),
        configService.network.addresses.vault,
        vaultAbi,
        'setRelayerApproval',
        [account.value, batchRelayerAddress, true]
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveBatchRelayer'),
        details: {
          contractAddress: vaultAddress,
          spender: batchRelayerAddress
        }
      });
      txListener(tx, {
        onTxConfirmed: () => {
          approving.value = false;
          approved.value = true;
        },
        onTxFailed: () => {
          approving.value = false;
        }
      });
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  return {
    approving,
    approve,
    approved,
    isUnlocked
  };
}
