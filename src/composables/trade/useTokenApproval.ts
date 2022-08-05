import { TransactionResponse } from '@ethersproject/providers';
import { computed, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { isSameAddress } from '@/lib/utils';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';

import useConfig from '../useConfig';
import useEthers from '../useEthers';
import useTokens from '../useTokens';
import useTransactions from '../useTransactions';

export default function useTokenApproval(
  tokenInAddress: Ref<string>,
  amount: Ref<string>,
  tokens: Ref<TokenInfoMap>
) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approved = ref(false);
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * COMPOSABLES
   */
  const { getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { networkConfig } = useConfig();
  const { approvalRequired, dynamicDataLoading } = useTokens();

  /**
   * COMPUTED
   */
  const allowanceState = computed(() => {
    if (
      isSameAddress(tokenInAddress.value, networkConfig.nativeAsset.address)
    ) {
      return {
        isUnlockedV2: true,
        approvedSpenders: {},
      };
    }

    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return {
        isUnlockedV2: true,
        approvedSpenders: {},
      };

    const v2ApprovalRequired = approvalRequired(
      tokenInAddress.value,
      amount.value
    );

    return {
      isUnlockedV2: !v2ApprovalRequired,
    };
  });

  const isUnlockedV2 = computed(() => allowanceState.value.isUnlockedV2);

  /**
   * METHODS
   */
  async function approveSpender(spender: string): Promise<void> {
    approving.value = true;
    try {
      const [tx] = await approveTokens(getProvider(), spender, [
        tokenInAddress.value,
      ]);
      txHandler(tx, spender);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  async function approveV2(): Promise<void> {
    console.log('[TokenApproval] Unlock V2');
    approveSpender(configService.network.addresses.vault);
  }

  function txHandler(tx: TransactionResponse, spender: string): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: t('transactionSummary.approveForTrading', [
        tokens.value[tokenInAddress.value]?.symbol,
      ]),
      details: {
        contractAddress: tokenInAddress.value,
        spender,
      },
    });

    txListener(tx, {
      onTxConfirmed: () => {
        approving.value = false;
        approved.value = true;
      },
      onTxFailed: () => {
        approving.value = false;
      },
    });
  }

  /**
   * WATCHERS
   */
  watch(tokenInAddress, async () => {
    if (
      isSameAddress(tokenInAddress.value, networkConfig.nativeAsset.address)
    ) {
      approved.value = true;
    } else {
      approved.value = false;
    }
  });

  return {
    approved,
    approving,
    approveV2,
    approveSpender,
    allowanceState,
    isUnlockedV2,
    isLoading: dynamicDataLoading,
  };
}
