import { isSameAddress } from '@/lib/utils';
import { useTokens } from '@/providers/tokens.provider';

import useAddLiquidityTabs, {
  Tab,
  tabs,
} from '@/composables/pools/useAddLiquidityTabs';
import { AmountIn, useJoinPool } from '@/providers/local/join-pool.provider';
import { usePool } from '@/providers/local/pool.provider';

export function useMyWallet() {
  /**
   * COMPOSABLES
   */
  const { pool, isLoadingPool } = usePool();
  const { setAmountsIn, setJoinWithNativeAsset, isSingleAssetJoin, amountsIn } =
    useJoinPool();
  const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens();
  const { activeTab } = useAddLiquidityTabs();

  /**
   * COMPUTED
   */
  const excludedTokens = computed<string[]>(() => {
    return pool.value?.address ? [pool.value.address] : [];
  });

  /**
   * METHODS
   */

  function setMaxAmount(address: string, maxBalance: string) {
    if (isSingleAssetJoin.value) {
      // Set the new Token address, and set the input value to max token balance
      setAmountsIn([
        {
          address: address,
          value: maxBalance,
          valid: true,
        },
      ]);
    } else {
      const isNativeAsset = isSameAddress(address, nativeAsset.address);
      const isWrappedNativeAsset = isSameAddress(
        address,
        wrappedNativeAsset.value.address
      );
      // If the token is ETH or WETH, we find the other one and switch the token address
      if (isNativeAsset || isWrappedNativeAsset) {
        setJoinWithNativeAsset(isNativeAsset);
      }
      // Find the token in the amounts array
      const amountIn: AmountIn | undefined = amountsIn.value.find(item =>
        isSameAddress(address, item.address)
      );

      // Update the amount in values
      if (amountIn) {
        amountIn.valid = true;
        amountIn.value = maxBalance;
      }
    }
  }

  function handleMyWalletTokenClick(address: string, isPoolToken: boolean) {
    const maxBalance = getMaxBalanceFor(address);

    if (isPoolToken) {
      setMaxAmount(address, maxBalance);
    } else {
      // If non pool token is clicked, switch to Single Token tab
      activeTab.value = tabs[Tab.SingleToken].value;
      // Wait for the tab to update, the set the max amount
      nextTick(() => {
        setMaxAmount(address, maxBalance);
      });
    }
  }

  return {
    handleMyWalletTokenClick,
    isLoadingPool,
    pool,
    excludedTokens,
    amountsIn,
    setAmountsIn,
    activeTab,
  };
}
