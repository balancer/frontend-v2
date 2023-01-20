import useNumbers from '@/composables/useNumbers';
import { fiatValueOf, isDeep, tokenTreeNodes } from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';
import { useTxState } from '@/composables/useTxState';
import { useUserSettings } from '../user-settings.provider';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import symbolKeys from '@/constants/symbol.keys';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnSum, bnum, removeAddress } from '@/lib/utils';
import { JoinPoolService } from '@/services/balancer/pools/joins/join-pool.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
  onBeforeMount,
  onMounted,
  PropType,
  provide,
  reactive,
  readonly,
  ref,
  toRef,
  watch,
} from 'vue';
import useRelayerApprovalTx from '@/composables/approvals/useRelayerApprovalTx';
import { TransactionActionInfo } from '@/types/transactions';
import useRelayerApproval, {
  RelayerType,
} from '@/composables/approvals/useRelayerApproval';
import { useQuery, useQueryClient } from 'vue-query';
import QUERY_KEYS, { QUERY_JOIN_ROOT_KEY } from '@/constants/queryKeys';
import { captureException } from '@sentry/browser';
import debounce from 'debounce-promise';

/**
 * TYPES
 */
export type AmountIn = {
  address: string;
  value: string;
  valid: boolean;
};

type Props = {
  pool: Pool;
  isSingleAssetJoin: boolean;
};

/**
 * JoinPoolProvider
 *
 * Handles pool joining state and transaction execution.
 */
const provider = (props: Props) => {
  /**
   * STATE
   */
  const pool = toRef(props, 'pool');
  const isMounted = ref(false);
  const isSingleAssetJoin = toRef(props, 'isSingleAssetJoin');
  const amountsIn = ref<AmountIn[]>([]);
  const bptOut = ref<string>('0');
  const priceImpact = ref<number>(0);
  const highPriceImpactAccepted = ref<boolean>(false);
  const txError = ref<string>('');

  const debounceQueryJoin = debounce(queryJoin, 1000);

  const queryEnabled = computed(
    (): boolean => isMounted.value && !txInProgress.value
  );
  const queryJoinQuery = useQuery<void, Error>(
    QUERY_KEYS.Pools.Joins.QueryJoin(
      // If amountsIn change we should call queryJoin to get expected output.
      amountsIn,
      // If the global pool fetching for the SOR changes it's been set to true. In
      // this case we should re-trigger queryJoin to fetch the expected output for
      // any existing input.
      hasFetchedPoolsForSor,
      isSingleAssetJoin
    ),
    debounceQueryJoin,
    reactive({ enabled: queryEnabled, refetchOnWindowFocus: false })
  );

  /**
   * SERVICES
   */
  const joinPoolService = new JoinPoolService(pool);

  /**
   * COMPOSABLES
   */
  const { getTokens, prices, injectTokens, priceFor } = useTokens();
  const { toFiat } = useNumbers();
  const { slippageBsp } = useUserSettings();
  const { getSigner } = useWeb3();
  const { txState, txInProgress, resetTxState } = useTxState();
  const relayerApproval = useRelayerApprovalTx(RelayerType.BATCH_V4);
  const { relayerSignature, relayerApprovalAction } = useRelayerApproval(
    RelayerType.BATCH_V4
  );
  const queryClient = useQueryClient();

  /**
   * COMPUTED
   */
  const isDeepPool = computed((): boolean => isDeep(pool.value));

  // All tokens in the pool token tree that can be used in join functions.
  const joinTokens = computed((): string[] => {
    let addresses: string[] = [];

    addresses = isDeepPool.value
      ? tokenTreeNodes(pool.value.tokens)
      : pool.value.tokensList;

    return removeAddress(pool.value.address, addresses);
  });

  // Token meta data for amountsIn tokens.
  const tokensIn = computed((): TokenInfoMap => {
    return getTokens(amountsIn.value.map(a => a.address));
  });

  // High price impact if value greater than 1%.
  const highPriceImpact = computed((): boolean => {
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
  });

  // rekt price impact if value greater than 20%.
  const rektPriceImpact = computed((): boolean => {
    return bnum(priceImpact.value).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT);
  });

  // If price impact is high (> 1%), user has checked acceptance checkbox.
  const hasAcceptedHighPriceImpact = computed((): boolean =>
    highPriceImpact.value ? highPriceImpactAccepted.value : true
  );

  // Checks if all amountsIn are valid inputs.
  const hasValidInputs = computed(
    (): boolean =>
      amountsIn.value.every(amountIn => amountIn.valid === true) &&
      hasAcceptedHighPriceImpact.value
  );

  // Checks if amountsIn has any values > 0.
  const hasAmountsIn = computed(() =>
    amountsIn.value.some(amountIn => bnum(amountIn.value).gt(0))
  );

  // amountsIn with value greater than 0.
  const amountsInWithValue = computed((): AmountIn[] =>
    amountsIn.value.filter(amountIn => bnum(amountIn.value).gt(0))
  );

  // If we don't have price for an amountIn that has a value greater than 0.
  const missingPricesIn = computed(
    (): boolean =>
      !amountsInWithValue.value.every(amountIn =>
        bnum(priceFor(amountIn.address)).gt(0)
      )
  );

  // Calculates total fiat value in for all amountsIn with Coingecko prices.
  const fiatValueIn = computed((): string => {
    const fiatValuesIn = amountsIn.value.map(amountIn =>
      toFiat(amountIn.value || 0, amountIn.address)
    );
    return bnSum(fiatValuesIn).toString();
  });

  // Calculates estimated fiatValueOut using pool's totalLiquity.
  // Could be inaccurate if total liquidity has come from subgraph.
  const fiatValueOut = computed((): string =>
    fiatValueOf(pool.value, bptOut.value)
  );

  const shouldSignRelayer = computed(
    (): boolean =>
      isDeepPool.value &&
      !isSingleAssetJoin.value &&
      // Check if Batch Relayer is either approved, or signed
      !(relayerApproval.isUnlocked.value || relayerSignature.value)
  );

  const approvalActions = computed((): TransactionActionInfo[] =>
    shouldSignRelayer.value ? [relayerApprovalAction.value] : []
  );

  const isLoadingQuery = computed(
    (): boolean => queryJoinQuery.isFetching.value
  );

  const queryError = computed(
    (): string | undefined => queryJoinQuery.error.value?.message
  );

  /**
   * METHODS
   */

  /**
   * Sets full amountsIn state.
   *
   * @param {AmountIn[]} _amountsIn - Array of amounts in: token address, value
   * & input validity.
   */
  function setAmountsIn(_amountsIn: AmountIn[]) {
    amountsIn.value = _amountsIn;
  }

  /**
   * Adds amountsIn with no value for array of token addresses.
   *
   * @param {string[]} tokensIn - Array of token addresses.
   */
  function addTokensIn(tokensIn: string[]) {
    tokensIn.forEach(address =>
      amountsIn.value.push({ address, value: '', valid: true })
    );
  }

  /**
   * Resets all amounts in amountsIn state to have no value.
   */
  function resetAmounts() {
    amountsIn.value.forEach((_, i) => {
      amountsIn.value[i].value = '';
    });
  }

  /**
   * Resets previous joinQuery results
   */
  function resetQueryJoinState() {
    bptOut.value = '0';
    priceImpact.value = 0;
    queryJoinQuery.remove.value();
  }

  /**
   * Simulate join transaction to get expected output and calculate price impact.
   */
  async function queryJoin() {
    // If form is empty or inputs are not valid, clear the price impact and
    // return early
    if (!hasAmountsIn.value) {
      priceImpact.value = 0;
      return;
    }

    // Invalidate previous query in order to prevent stale data
    queryClient.invalidateQueries(QUERY_JOIN_ROOT_KEY);

    try {
      joinPoolService.setJoinHandler(isSingleAssetJoin.value);

      const output = await joinPoolService.queryJoin({
        amountsIn: amountsInWithValue.value,
        tokensIn: tokensIn.value,
        prices: prices.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
      });

      bptOut.value = output.bptOut;
      priceImpact.value = output.priceImpact;
    } catch (error) {
      captureException(error);
      throw new Error('Failed to construct join.', { cause: error });
    }
  }

  /**
   * Executes join transaction.
   */
  async function join(): Promise<TransactionResponse> {
    try {
      txError.value = '';
      joinPoolService.setJoinHandler(isSingleAssetJoin.value);

      return joinPoolService.join({
        amountsIn: amountsInWithValue.value,
        tokensIn: tokensIn.value,
        prices: prices.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        relayerSignature: relayerSignature.value,
      });
    } catch (error) {
      txError.value = (error as Error).message;
      throw new Error('Failed to submit join transaction.', { cause: error });
    }
  }

  /**
   * WATCHERS
   */

  // If singleAssetJoin is toggled we need to reset previous query state. queryJoin
  // will be re-triggered by the amountsIn state change. We also need to call
  // setJoinHandler on the joinPoolService to update the join handler.
  watch(isSingleAssetJoin, newVal => {
    resetQueryJoinState();
    joinPoolService.setJoinHandler(newVal);
  });

  /**
   * LIFECYCLE
   */
  onBeforeMount(() => {
    // Ensure prices are fetched for token tree. When pool architecture is
    // refactoted probably won't be required.
    injectTokens(joinTokens.value);
  });

  onMounted(() => (isMounted.value = true));

  return {
    // State
    amountsIn,
    highPriceImpactAccepted,
    pool: readonly(pool),
    isSingleAssetJoin: readonly(isSingleAssetJoin),
    bptOut: readonly(bptOut),
    priceImpact: readonly(priceImpact),
    txError: readonly(txError),

    //  Computed
    isLoadingQuery,
    queryError,
    joinTokens,
    highPriceImpact,
    rektPriceImpact,
    hasAcceptedHighPriceImpact,
    hasValidInputs,
    hasAmountsIn,
    fiatValueIn,
    fiatValueOut,
    txState,
    txInProgress,
    approvalActions,
    missingPricesIn,

    // Methods
    setAmountsIn,
    addTokensIn,
    resetAmounts,
    join,
    resetTxState,

    // queries
    queryJoinQuery,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type Response = ReturnType<typeof provider>;
export const JoinPoolProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.JoinPool
);

/**
 * <JoinPoolProvider /> component.
 */
export const JoinPoolProvider = defineComponent({
  name: 'JoinPoolProvider',

  props: {
    pool: {
      type: Object as PropType<Pool>,
      required: true,
    },
    isSingleAssetJoin: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    provide(JoinPoolProviderSymbol, provider(props));
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  },
});
