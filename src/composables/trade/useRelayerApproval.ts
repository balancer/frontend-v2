import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Container } from 'typedi';

import useWeb3 from '@/services/web3/useWeb3';

import useTransactions from '../useTransactions';
import useEthers from '../useEthers';
import { ConfigService } from '@/services/config/config.service';

import vaultAbi from '@/lib/abi/Vault.json';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import useRelayerApprovalQuery from '../queries/useRelayerApprovalQuery';
import { GP_RELAYER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';

const vaultAddress = Container.get(ConfigService).network.addresses.vault;

export enum Relayer {
  GNOSIS = 'gnosis',
  LIDO = 'lido'
}

export default function useRelayerApproval(
  relayer: Relayer,
  isEnabled: Ref<boolean>
) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approved = ref(false);

  /**
   * COMPOSABLES
   */
  const { getProvider, account } = useWeb3();
  const relayerAddress = ref(
    relayer === Relayer.LIDO
      ? Container.get(ConfigService).network.addresses.lidoRelayer
      : GP_RELAYER_CONTRACT_ADDRESS
  );
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();
  const relayerApproval = useRelayerApprovalQuery(relayerAddress);

  /**
   * COMPUTED
   */

  const isUnlocked = computed(() =>
    approved.value || !isEnabled.value ? true : !!relayerApproval.data.value
  );

  /**
   * METHODS
   */
  async function approve(): Promise<void> {
    approving.value = true;
    try {
      const tx = await sendTransaction(
        getProvider(),
        Container.get(ConfigService).network.addresses.vault,
        vaultAbi,
        'setRelayerApproval',
        [account.value, relayerAddress.value, true]
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary:
          relayer === Relayer.LIDO
            ? t('transactionSummary.approveLidoRelayer')
            : t('transactionSummary.approveGnosisRelayer'),
        details: {
          contractAddress: vaultAddress,
          spender: relayerAddress.value
        }
      });

      txListener(tx, {
        onTxConfirmed: () => {
          approving.value = false;
          approved.value = true;
          relayerApproval.refetch.value();
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
