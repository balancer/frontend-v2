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
        isUnlockedV2: true,
        approvedSpenders: {}
      };
    }

    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return {
        isUnlockedV1: true,
        isUnlockedV2: true,
        approvedSpenders: {}
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

  const isUnlockedV1 = computed(() => allowanceState.value.isUnlockedV1);
  const isUnlockedV2 = computed(() => allowanceState.value.isUnlockedV2);

  /**
   * METHODS
   */
  async function approveSpender(spender: string): Promise<void> {
    approving.value = true;
    try {
      const [tx] = await approveTokens(getProvider(), spender, [
        tokenInAddress.value
      ]);
      txHandler(tx, spender);
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  async function approveV1(): Promise<void> {
    console.log('[TokenApproval] Unlock V1');
    approveSpender(configService.network.addresses.exchangeProxy);
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
        tokens.value[tokenInAddress.value].symbol
      ]),
      details: {
        contractAddress: tokenInAddress.value,
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
    approved,
    approving,
    approveV1,
    approveV2,
    approveSpender,
    allowanceState,
    isUnlockedV1,
    isUnlockedV2,
    isLoading: dynamicDataLoading
  };
}
