import useWeb3 from '@/services/web3/useWeb3';
import { ref, watch } from 'vue';
import useNetwork from './useNetwork';
import { Relayer } from '@balancer-labs/sdk';
import { configService } from '@/services/config/config.service';
import { Vault__factory } from '@balancer-labs/typechain';
import { useI18n } from 'vue-i18n';
import { TransactionActionInfo } from '@/types/transactions';
import {
  relayerAddressMap,
  Relayer as RelayerType,
} from '@/composables/trade/useRelayerApproval';

/**
 * STATE
 */
const relayerSignature = ref<string>('');

export default function useSignRelayerApproval(relayerType: RelayerType) {
  /**
   * COMPOSABLES
   */
  const { account, getSigner } = useWeb3();
  const { networkId } = useNetwork();
  const { t } = useI18n();

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

  const signRelayerAction: TransactionActionInfo = {
    label: t('approveBatchRelayer'),
    loadingLabel: t('checkWallet'),
    confirmingLabel: t('approvingBatchRelayer'),
    stepTooltip: t('approveBatchRelayerTooltip'),
    action: signRelayerApproval as () => Promise<any>,
    isSignAction: true,
  };

  /**
   * WATCHERS
   */
  watch([account, networkId], () => {
    relayerSignature.value = '';
  });

  return {
    relayerSignature,
    signRelayerApproval,
    signRelayerAction,
  };
}
