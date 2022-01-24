import { Ref, computed, reactive, toRefs } from 'vue';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import { isStablePhantom } from '@/composables/usePool';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';
import { BaseContent } from '@/types';
import i18n from '@/plugins/i18n';

/**
 * TYPES
 */
export enum WithdrawalError {
  SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT = 'SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT'
}

type WithdrawalState = {
  isProportional: boolean;
  tokenOut: string;
  validInput: boolean;
  highPriceImpactAccepted: boolean;
  submitting: boolean;
  sorReady: boolean;
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
  slider: {
    val: 1000,
    max: 1000,
    min: 0,
    interval: 1
  },
  error: null
});

/**
 * METHODS
 */
export function setError(error: WithdrawalError | null): void {
  state.error = error;
}

export function parseError(error: WithdrawalError): BaseContent {
  switch (error) {
    case WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT:
      return {
        title: i18n.global.t('warning'),
        description: i18n.global.t(
          `withdraw.errors.${WithdrawalError.SINGLE_ASSET_WITHDRAWAL_MIN_BPT_LIMIT}`
        )
      };
    default:
      return {
        title: i18n.global.t('Ooops'),
        description: i18n.global.t('somethingWentWrong')
      };
  }
}

export default function useWithdrawalState(pool: Ref<FullPool | undefined>) {
  /**
   * COMPOSABLES
   */
  const { nativeAsset, wrappedNativeAsset } = useTokens();
  const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

  /**
   * COMPUTED
   */
  const tokensOut = computed(() => {
    if (!pool.value) return [];
    const poolTokens = isStablePhantom(pool.value.poolType)
      ? pool.value.mainTokens || []
      : pool.value.tokenAddresses;

    if (!state.isProportional && state.tokenOut === nativeAsset.address)
      // replace WETH with ETH
      return poolTokens.map(address => {
        if (address === wrappedNativeAsset.value.address) {
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
  function maxSlider(): void {
    state.slider.val = state.slider.max;
  }

  return {
    ...toRefs(state),
    tokensOut,
    tokenOutIndex,
    batchRelayerApproval,
    // methods
    maxSlider,
    setError,
    parseError
  };
}
