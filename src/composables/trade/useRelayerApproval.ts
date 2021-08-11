import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useWeb3 from '@/services/web3/useWeb3';

import useTransactions from '../useTransactions';
import useEthers from '../useEthers';
import { configService } from '@/services/config/config.service';

import vaultAbi from '@/lib/abi/Vault.json';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import useRelayerApprovalQuery from '../queries/useRelayerApprovalQuery';

const vaultAddress = configService.network.addresses.vault;

export default function useRelayerApproval(relayerAddress: Ref<string>) {
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
  const relayerApproval = useRelayerApprovalQuery(relayerAddress);

  /**
   * COMPUTED
   */

  const isUnlocked = computed(() =>
    approved.value ? true : !!relayerApproval.data.value
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
        [account.value, relayerAddress.value, true]
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveRelayer'),
        details: {
          contractAddress: vaultAddress,
          spender: relayerAddress.value
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
