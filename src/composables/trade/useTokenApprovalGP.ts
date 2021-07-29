import { computed, Ref, ref } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { approveTokens } from '@/lib/utils/balancer/tokens';
import { GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens2 from '@/composables/useTokens2';
import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import { useI18n } from 'vue-i18n';

export default function useTokenApprovalGP(
  tokenInAddress: Ref<string>,
  amount: Ref<string>
) {
  /**
   * STATE
   */
  const approving = ref(false);
  const approved = ref(false);

  /**
   * COMPOSABLES
   */
  const { getProvider } = useWeb3();
  const provider = getProvider();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();
  const {
    allTokens: tokens,
    approvalsRequired,
    dynamicDataLoading
  } = useTokens2({
    allowanceContracts: [GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS]
  });

  /**
   * COMPUTED
   */
  const allowanceState = computed(() => {
    if (!tokenInAddress.value || !amount.value || approved.value) {
      return {
        isUnlocked: true
      };
    }

    const tokenInDecimals = tokens.value[tokenInAddress.value].decimals;

    const requiredApprovals = approvalsRequired(
      [tokenInAddress.value],
      [parseUnits(amount.value, tokenInDecimals).toString()],
      GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS
    );

    return {
      isUnlocked: requiredApprovals.length === 0
    };
  });

  const isApproved = computed(() => allowanceState.value.isUnlocked);

  /**
   * METHODS
   */
  async function approve(): Promise<void> {
    console.log('[TokenApproval] Unlock token for trading on Gnosis Protocol');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        provider,
        GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS,
        [tokenInAddress.value]
      );
      const tokenInSymbol = tokens.value[tokenInAddress.value].symbol;

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveForTrading', [tokenInSymbol]),
        details: {
          tokenAddress: tokenInAddress.value,
          spender: GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS
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
    } catch (e) {
      console.log(e);
      approving.value = false;
    }
  }

  return {
    approving,
    approve,
    allowanceState,
    isApproved,
    isLoading: dynamicDataLoading
  };
}
