import { computed, Ref, ref, watch } from 'vue';
import { Web3Provider } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';

import { ETHER } from '@/constants/tokenlists';

import { approveTokens } from '@/lib/utils/balancer/tokens';

import { GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';
import useVueWeb3 from '@/services/web3/useVueWeb3';

import useTokens from '../useTokens';
import useAllowances from '../useAllowances';
import useEthers from '../useEthers';

export default function useTokenApprovalGP(
  tokenInAddress: Ref<string>,
  amount: Ref<string>
) {
  const approving = ref(false);
  const approved = ref(false);

  // COMPOSABLES
  const { provider } = useVueWeb3();
  const { tokens } = useTokens();
  const { txListener: ethersTxListener } = useEthers();

  const dstList = computed(() => [GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS]);
  const allowanceTokens = computed(() => [tokenInAddress.value]);
  const {
    getRequiredAllowances,
    isLoading: isLoadingAllowances
  } = useAllowances({
    dstList,
    tokens: allowanceTokens
  });

  const allowanceState = computed(() => {
    if (tokenInAddress.value === ETHER.address) {
      return {
        isUnlocked: true
      };
    }

    if (!tokenInAddress.value || !amount.value || approved.value === true)
      return {
        isUnlocked: true
      };

    const tokenInDecimals = tokens.value[tokenInAddress.value].decimals;
    const tokenInAmountDenorm = parseUnits(amount.value, tokenInDecimals);

    const requiredAllowances = getRequiredAllowances({
      dst: GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS,
      tokens: [tokenInAddress.value],
      amounts: [tokenInAmountDenorm.toString()]
    });

    return {
      isUnlocked: requiredAllowances.length === 0
    };
  });

  async function approve(): Promise<void> {
    console.log('[TokenApproval] Unlock token for trading on Gnosis Protocol');
    approving.value = true;
    try {
      const [tx] = await approveTokens(
        provider.value as Web3Provider,
        GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS,
        [tokenInAddress.value]
      );
      ethersTxListener(tx, {
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

  const isApproved = computed(() => {
    return allowanceState.value.isUnlocked;
  });

  watch(tokenInAddress, async () => {
    if (tokenInAddress.value === ETHER.address) {
      approved.value = true;
    } else {
      approved.value = false;
    }
  });

  return {
    approving,
    approve,
    allowanceState,
    isApproved,
    isLoading: isLoadingAllowances
  };
}
