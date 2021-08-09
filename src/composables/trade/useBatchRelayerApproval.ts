import { computed, Ref, ref } from 'vue';
import { parseUnits } from '@ethersproject/units';
import { useI18n } from 'vue-i18n';

import { approveTokens } from '@/lib/utils/balancer/tokens';

import useWeb3 from '@/services/web3/useWeb3';

import useTokens from '@/composables/useTokens';

import useTransactions from '../useTransactions';
import useEthers from '../useEthers';
import { configService } from '@/services/config/config.service';
import { getAddress } from 'ethers/lib/utils';

const stETHAddress = configService.network.addresses.stETH;
const batchRelayerAddress = configService.network.addresses.stETH;

export default function useBatchRelayerApproval(
  isStETHTrade: boolean,
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
  const { tokens, approvalsRequired, dynamicDataLoading } = useTokens();

  /**
   * COMPUTED
   */
  const allowanceState = computed(() => {
    if (!isStETHTrade || !amount.value || approved.value) {
      return {
        isUnlocked: true
      };
    }

    const tokenInDecimals = tokens.value[getAddress(stETHAddress)].decimals;

    const requiredApprovals = approvalsRequired(
      [getAddress(stETHAddress)],
      [parseUnits(amount.value, tokenInDecimals).toString()],
      batchRelayerAddress
    );

    return {
      isUnlocked: requiredApprovals.length === 0
    };
  });

  const isUnlocked = computed(() => allowanceState.value.isUnlocked);

  /**
   * METHODS
   */
  async function approve(): Promise<void> {
    console.log(
      '[TokenApproval] Unlock token for trading using the batch relayer'
    );
    approving.value = true;
    try {
      const [tx] = await approveTokens(provider, batchRelayerAddress, [
        stETHAddress
      ]);

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: t('transactionSummary.approveBatchRelayer'),
        details: {
          tokenAddress: stETHAddress,
          spender: batchRelayerAddress
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
    approved,
    allowanceState,
    isUnlocked,
    isLoading: dynamicDataLoading
  };
}
