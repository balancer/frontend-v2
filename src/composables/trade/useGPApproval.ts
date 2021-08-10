import { ref } from 'vue';
import { GP_RELAYER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';
import useRelayerApproval from './useRelayerApproval';

export default function useGPApproval() {
  const gnosisRelayerAddress = ref(GP_RELAYER_CONTRACT_ADDRESS);

  return useRelayerApproval(gnosisRelayerAddress);
}
