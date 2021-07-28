import { computed, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { parseUnits } from '@ethersproject/units';
import { TransactionResponse } from '@ethersproject/providers';

import { approveTokens } from '@/lib/utils/balancer/tokens';
import { ETHER } from '@/constants/tokenlists';

import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';

import useAllowances from '../useAllowances';
import useTransactions from '../useTransactions';
import useEthers from '../useEthers';

import { TokenMap } from '@/types';

export default function useTokenApproval(
  tokenInAddress: Ref<string>,
  amount: Ref<string>,
  tokens: Ref<TokenMap>
) {
  const approving = ref(false);
  const approved = ref(false);
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  // COMPOSABLES
  const { getProvider } = useWeb3();

  const { txListener } = useEthers();

  const dstList = computed(() => [
    configService.network.addresses.exchangeProxy
  ]);
  const allowanceTokens = computed(() => [tokenInAddress.value]);
  const {
    getRequiredAllowances,
    isLoading: isLoadingAllowances
  } = useAllowances({
    dstList: dstList.value,
    tokens: allowanceTokens.value
  });

  const allowanceState = computed(() => {
    if (tokenInAddress.value === ETHER.address) {
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

    const requiredAllowancesV1 = getRequiredAllowances({
      dst: configService.network.addresses.exchangeProxy,
      tokens: [tokenInAddress.value],
      amounts: [tokenInAmountDenorm.toString()]
    });

    const requiredAllowancesV2 = getRequiredAllowances({
      tokens: [tokenInAddress.value],
      amounts: [tokenInAmountDenorm.toString()]
    });

    return {
      isUnlockedV1: requiredAllowancesV1.length === 0,
      isUnlockedV2: requiredAllowancesV2.length === 0
    };
  });

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

  watch(tokenInAddress, async () => {
    if (tokenInAddress.value === ETHER.address) {
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
    isLoading: isLoadingAllowances
  };
}
