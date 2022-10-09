import { computed, reactive, Ref, toRefs } from 'vue';

import useRelayerApproval, {
  Relayer,
} from '@/composables/trade/useRelayerApproval';
import { isDeep } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import i18n from '@/plugins/i18n';
import { Pool } from '@/services/pool/types';
import { BaseContent } from '@/types';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { useTokenHelpers } from '@/composables/useTokenHelpers';

/**
 * TYPES
 */
export enum WithdrawalError {
  SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT = 'SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT',
}

type WithdrawalState = {
  isProportional: boolean;
  tokenOut: string;
  validInput: boolean;
  highPriceImpactAccepted: boolean;
  submitting: boolean;
  sorReady: boolean;
  tx: {
    init: boolean;
    confirming: boolean;
    confirmed: boolean;
    confirmedAt: string;
    receipt?: TransactionReceipt;
  };
  slider: {
    val: number;
    max: number;
    min: number;
    interval: number;
  };
  error: WithdrawalError | null;
};

/**
 * STATE
 */
const state = reactive<WithdrawalState>({
  isProportional: true,
  tokenOut: '',
  validInput: true,
  highPriceImpactAccepted: false,
  submitting: false,
  sorReady: false,
  tx: {
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
  },
  slider: {
    val: 1000,
    max: 1000,
    min: 0,
    interval: 1,
  },
  error: null,
});

/**
 * METHODS
 */
export function setError(error: WithdrawalError | null): void {
  state.error = error;
}

export function resetTxState(): void {
  state.tx = {
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
  };
}

export function parseError(error: WithdrawalError): BaseContent {
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

const txInProgress = computed(
  (): boolean => state.tx.init || state.tx.confirming || state.tx.confirmed
);

export default function useWithdrawalState(pool: Ref<Pool | undefined>) {
  /**
   * COMPOSABLES
   */
  const { nativeAsset } = useTokens();
  const { replaceWethWithEth } = useTokenHelpers();
  const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

  /**
   * COMPUTED
   */
  const tokensOut = computed(() => {
    if (!pool.value) return [];
    const poolTokens = isDeep(pool.value)
      ? pool.value.mainTokens || []
      : pool.value.tokensList;

    if (!state.isProportional && state.tokenOut === nativeAsset.address)
      // replace WETH with ETH
      return replaceWethWithEth(poolTokens);

    return poolTokens;
  });

  const tokenOutIndex = computed(() => {
    return tokensOut.value.indexOf(state.tokenOut);
  });

  /**
   * METHODS
   */
  function maxSlider(): void {
    state.slider.val = state.slider.max;
  }

  return {
    ...toRefs(state),
    tokensOut,
    tokenOutIndex,
    batchRelayerApproval,
    txInProgress,
    // methods
    maxSlider,
    setError,
    parseError,
    resetTxState,
  };
}
