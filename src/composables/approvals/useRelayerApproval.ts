import useWeb3 from '@/services/web3/useWeb3';
import { computed, ref, watch } from 'vue';
import useNetwork from '../useNetwork';
import { Relayer } from '@balancer-labs/sdk';
import { configService } from '@/services/config/config.service';
import { Vault__factory } from '@balancer-labs/typechain';
import { useI18n } from 'vue-i18n';
import { TransactionActionInfo } from '@/types/transactions';
import useRelayerApprovalTx from '@/composables/approvals/useRelayerApprovalTx';
import useGnosisSafeApp from '@/composables/useGnosisSafeApp';
import { COW_RELAYER_CONTRACT_ADDRESS } from '@/services/cowswap/constants';

/**
 * TYPES
 */
export enum RelayerType {
  COWSWAP = 'Cowswap',
  LIDO = 'Lido',
  BATCH = 'Batch',
  BATCH_V4 = 'BATCH_V4',
}

export const relayerAddressMap = {
  [RelayerType.COWSWAP]: COW_RELAYER_CONTRACT_ADDRESS,
  [RelayerType.LIDO]: configService.network.addresses.lidoRelayer,
  [RelayerType.BATCH]: configService.network.addresses.batchRelayer,
  [RelayerType.BATCH_V4]: configService.network.addresses.batchRelayerV4,
};

/**
 * STATE
 */
const relayerSignature = ref<string>('');

export default function useRelayerApproval(relayerType: RelayerType) {
  /**
   * COMPOSABLES
   */
  const { account, getSigner } = useWeb3();
  const { networkId } = useNetwork();
  const { t } = useI18n();
  const { isGnosisSafeApp } = useGnosisSafeApp();
  const { action: transactionAction } = useRelayerApprovalTx(relayerType);

  const signatureAction: TransactionActionInfo = {
    label: t('approveBatchRelayer'),
    loadingLabel: t('checkWallet'),
    confirmingLabel: t('approvingBatchRelayer'),
    stepTooltip: t('approveBatchRelayerTooltip'),
    action: signRelayerApproval as () => Promise<any>,
    isSignAction: true,
  };

  /**
   * COMPUTED
   */
  const relayerApprovalAction = computed((): TransactionActionInfo => {
    return isGnosisSafeApp.value ? transactionAction.value : signatureAction;
  });

  /**
   * METHODS
   */
  async function signRelayerApproval(): Promise<void> {
    const relayerAddress = relayerAddressMap[relayerType];
    const signer = getSigner();
    const signerAddress = await signer.getAddress();
    const signature = await Relayer.signRelayerApproval(
      relayerAddress,
      signerAddress,
      signer,
      Vault__factory.connect(configService.network.addresses.vault, signer)
    );
    relayerSignature.value = signature;
  }

  /**
   * WATCHERS
   */
  watch([account, networkId], () => {
    relayerSignature.value = '';
  });

  return {
    relayerSignature,
    relayerApprovalAction,
  };
}
