import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';
import { useTokens } from '@/providers/tokens.provider';

export default function useNativeBalance() {
  const { hasBalance, nativeAsset, balanceFor } = useTokens();
  const nativeCurrency = configService.network.nativeAsset.symbol;

  const { appNetworkConfig, isWalletReady } = useWeb3();

  const nativeBalance = computed(() => {
    if (!isWalletReady.value) return '-';
    return Number(balanceFor(appNetworkConfig.nativeAsset.address)).toFixed(4);
  });

  const hasNativeBalance = computed(() => hasBalance(nativeAsset.address));

  return {
    hasNativeBalance,
    nativeBalance,
    nativeCurrency,
  };
}
