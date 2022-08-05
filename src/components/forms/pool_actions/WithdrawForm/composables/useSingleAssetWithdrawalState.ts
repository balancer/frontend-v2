import { computed, reactive, Ref, toRefs } from 'vue';

import useRelayerApproval, {
  Relayer,
} from '@/composables/trade/useRelayerApproval';
import { isStablePhantom } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { isSameAddress } from '@/lib/utils';
import i18n from '@/plugins/i18n';
import { Pool } from '@/services/pool/types';
import { BaseContent } from '@/types';

/**
 * TYPES
 */
export enum WithdrawalError {
  SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT = 'SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT',
}

type WithdrawalState = {
  tokenOut: string;
  validInput: boolean;
  highPriceImpactAccepted: boolean;
  submitting: boolean;
  error: WithdrawalError | null;
};

/**
 * STATE
 */
const state = reactive<WithdrawalState>({
  tokenOut: '',
  validInput: true,
  highPriceImpactAccepted: false,
  submitting: false,
  error: null,
});

/**
 * METHODS
 */
export function setError(error: WithdrawalError | null): void {
  state.error = error;
}

export function parseError(error: WithdrawalError): BaseContent {
  console.log({ error });
  switch (error) {
    case WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT:
      return {
        title: i18n.global.t('warning'),
        description: i18n.global.t(
          `withdraw.errors.${WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT}`
        ),
      };
    default:
      return {
        title: i18n.global.t('Ooops'),
        description: i18n.global.t('somethingWentWrong'),
      };
  }
}

export default function useWithdrawalState(pool: Ref<Pool | undefined>) {
  /**
   * COMPOSABLES
   */
  const { nativeAsset, wrappedNativeAsset, tokens } = useTokens();
  const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

  /**
   * COMPUTED
   */
  const tokensOut = computed(() => {
    if (!pool.value) return [];
    const poolTokens = isStablePhantom(pool.value.poolType)
      ? Object.keys(tokens.value) || []
      : pool.value.tokensList;

    if (state.tokenOut === nativeAsset.address)
      // replace WETH with ETH
      return poolTokens.map(address => {
        if (isSameAddress(address, wrappedNativeAsset.value.address)) {
          return nativeAsset.address;
        }
        return address;
      });

    return poolTokens;
  });

  const tokenOutIndex = computed(() => {
    return tokensOut.value.indexOf(state.tokenOut);
  });

  /**
   * METHODS
   */

  return {
    ...toRefs(state),
    tokensOut,
    tokenOutIndex,
    batchRelayerApproval,
    // methods
    setError,
    parseError,
  };
}
