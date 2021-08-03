import { computed, Ref, ref, watch } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { TransactionResponse } from '@ethersproject/providers';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { configService } from '@/services/config/config.service';
import { TokenInfoMap } from '@/types/TokenList';
import useTokens from '../useTokens';
import useConfig from '../useConfig';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '../useTransactions';
import useEthers from '../useEthers';
import { useI18n } from 'vue-i18n';

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
  const { approvalsRequired, dynamicDataLoading } = useTokens();

  /**
   * COMPUTED
   */
  const allowanceState = computed(() => {
    if (tokenInAddress.value === networkConfig.nativeAsset.address) {
      return {
        isUnlockedV1: true,
        isUnlockedV2: true
      };
    }

    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return {
        isUnlockedV1: true,
        isUnlockedV2: true
      };

    const tokenInDecimals = tokens.value[tokenInAddress.value].decimals;
    const tokenInAmountDenorm = parseUnits(amount.value, tokenInDecimals);

    const requiredAllowancesV1 = approvalsRequired(
      [tokenInAddress.value],
      [tokenInAmountDenorm.toString()],
      configService.network.addresses.exchangeProxy
    );

    const requiredAllowancesV2 = approvalsRequired(
      [tokenInAddress.value],
      [tokenInAmountDenorm.toString()]
    );

    return {
      isUnlockedV1: requiredAllowancesV1.length === 0,
      isUnlockedV2: requiredAllowancesV2.length === 0
    };
  });

  /**
   * METHODS
   */
  async function approveV1(): Promise<void> {
    console.log('[TokenApproval] Unlock V1');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        getProvider(),
        configService.network.addresses.exchangeProxy,
        [tokenInAddress.value]
      );
      txHandler(tx, configService.network.addresses.exchangeProxy);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  async function approveV2(): Promise<void> {
    console.log('[TokenApproval] Unlock V2');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        getProvider(),
        configService.network.addresses.vault,
        [tokenInAddress.value]
      );
      txHandler(tx, configService.network.addresses.vault);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  function txHandler(tx: TransactionResponse, spender: string): void {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: t('transactionSummary.approveForTrading', [
        tokens.value[tokenInAddress.value].symbol
      ]),
      details: {
        tokenAddress: tokenInAddress.value,
        spender
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
  }

  /**
   * WATCHERS
   */
  watch(tokenInAddress, async () => {
    if (tokenInAddress.value === networkConfig.nativeAsset.address) {
      approved.value = true;
    } else {
      approved.value = false;
    }
  });

  return {
    approving,
    approveV1,
    approveV2,
    allowanceState,
    isLoading: dynamicDataLoading
  };
}
