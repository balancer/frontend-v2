import { computed, inject } from 'vue';
import Notify from 'bnc-notify';
import { bnNotifySymbol } from '@/plugins/blocknative';
import useWeb3 from '@/services/web3/useWeb3';

const SUPPORTED_NETWORKS = [1, 42];

export default function useBlocknative() {
  const { appNetworkConfig } = useWeb3();

  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  if (!notify) throw new Error('Blocknative Notify missing!');

  const supportsBlocknative = computed(() => {
    return SUPPORTED_NETWORKS.includes(appNetworkConfig.chainId);
  });

  function updateNotifyConfig(opts): void {
    notify.config(opts);
  }

  return {
    notify,
    supportsBlocknative,
    updateNotifyConfig
  };
}
