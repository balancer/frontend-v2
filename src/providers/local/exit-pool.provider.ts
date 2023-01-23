import useRelayerApprovalTx from '@/composables/approvals/useRelayerApprovalTx';
import useNumbers from '@/composables/useNumbers';
import {
  fiatValueOf,
  flatTokenTree,
  isDeep,
  isPreMintedBptType,
  tokenTreeLeafs,
  tokenTreeNodes,
  usePool,
} from '@/composables/usePool';
import useRelayerApproval, {
  RelayerType,
} from '@/composables/approvals/useRelayerApproval';
import { useTokens } from '@/providers/tokens.provider';
import { useTxState } from '@/composables/useTxState';
import { useUserSettings } from '@/providers/user-settings.provider';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import QUERY_KEYS, { QUERY_EXIT_ROOT_KEY } from '@/constants/queryKeys';
import symbolKeys from '@/constants/symbol.keys';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import {
  bnSum,
  bnum,
  isSameAddress,
  removeAddress,
  selectByAddress,
} from '@/lib/utils';
import {
  ExitHandler,
  ExitPoolService,
} from '@/services/balancer/pools/exits/exit-pool.service';
import { ExitType } from '@/services/balancer/pools/exits/handlers/exit-pool.handler';
import { Pool, PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionActionInfo } from '@/types/transactions';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
  onBeforeMount,
  PropType,
  provide,
  ref,
  reactive,
  toRef,
  watch,
  onMounted,
} from 'vue';
import { useQuery, useQueryClient } from 'vue-query';
import debounce from 'debounce-promise';
import { captureException } from '@sentry/browser';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  isSingleAssetExit: boolean;
};

export type AmountOut = {
  address: string;
  value: string;
  valid: boolean;
  max: string;
};

/**
 * ExitPoolProvider
 *
 * Handles pool exiting state and transaction execution.
 */
const provider = (props: Props) => {
  /**
   * STATE
   */
  const pool = toRef(props, 'pool');
  const isMounted = ref(false);
  const isSingleAssetExit = toRef(props, 'isSingleAssetExit');
  const priceImpact = ref<number>(0);
  const highPriceImpactAccepted = ref<boolean>(false);
  const bptIn = ref<string>('0');
  const bptInValid = ref<boolean>(true);
  const txError = ref<string>('');
  const singleAmountOut = reactive<AmountOut>({
    address: '',
    value: '',
    max: '',
    valid: true,
  });
  const propAmountsOut = ref<AmountOut[]>([]);

  /**
   * SERVICES
   */
  const exitPoolService = new ExitPoolService(pool);

  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { injectTokens, getTokens, prices, balanceFor } = useTokens();
  const { txState, txInProgress } = useTxState();
  const { slippageBsp } = useUserSettings();
  const { getSigner } = useWeb3();
  const relayerApproval = useRelayerApprovalTx(RelayerType.BATCH_V4);
  const { relayerSignature, relayerApprovalAction } = useRelayerApproval(
    RelayerType.BATCH_V4
  );
  const { isWeightedPool } = usePool(pool);

  const queryClient = useQueryClient();

  const debounceQueryExit = debounce(queryExit, 1000);
  const debounceGetSingleAssetMax = debounce(getSingleAssetMax, 1000, {
    leading: true,
  });

  const queriesEnabled = computed(
    (): boolean => isMounted.value && !txInProgress.value
  );

  const queryExitQuery = useQuery<void, Error>(
    QUERY_KEYS.Pools.Exits.QueryExit(
      bptIn,
      hasFetchedPoolsForSor,
      isSingleAssetExit,
      singleAmountOut
    ),
    debounceQueryExit,
    reactive({ enabled: queriesEnabled, refetchOnWindowFocus: false })
  );

  const singleAssetMaxQuery = useQuery<void, Error>(
    QUERY_KEYS.Pools.Exits.SingleAssetMax(
      hasFetchedPoolsForSor,
      isSingleAssetExit,
      toRef(singleAmountOut, 'address')
    ),
    debounceGetSingleAssetMax,
    reactive({ enabled: queriesEnabled, refetchOnWindowFocus: false })
  );

  /**
   * COMPUTED
   */
  const isLoadingQuery = computed(
    (): boolean =>
      !hasFetchedPoolsForSor.value || queryExitQuery.isFetching.value
  );

  const queryError = computed(
    (): string | undefined => queryExitQuery.error.value?.message
  );

  const isLoadingMax = computed(
    (): boolean =>
      singleAssetMaxQuery.isFetching.value ||
      !queriesEnabled.value ||
      !hasFetchedPoolsForSor.value
  );

  const maxError = computed(
    (): string | undefined => singleAssetMaxQuery.error.value?.message
  );

  const isDeepPool = computed((): boolean => isDeep(pool.value));

  const shouldSignRelayer = computed(
    (): boolean =>
      isDeepPool.value &&
      !isSingleAssetExit.value &&
      // Check if Batch Relayer is either approved, or signed
      !(relayerApproval.isUnlocked.value || relayerSignature.value)
  );

  const approvalActions = computed((): TransactionActionInfo[] =>
    shouldSignRelayer.value ? [relayerApprovalAction.value] : []
  );

  const shouldUseSwapExit = computed(
    (): boolean =>
      isSingleAssetExit.value &&
      isDeep(pool.value) &&
      isPreMintedBptType(pool.value.poolType)
  );

  const exitHandlerType = computed((): ExitHandler => {
    if (shouldUseSwapExit.value) return ExitHandler.Swap;
    if (isWeightedPool.value && isSingleAssetExit.value) {
      if (singleAssetMaxed.value) return ExitHandler.ExactIn;
      return ExitHandler.ExactOut;
    }

    return ExitHandler.Generalised;
  });

  // All token addresses (excl. pre-minted BPT) in the pool token tree that can be used in exit functions.
  const exitTokenAddresses = computed((): string[] => {
    let addresses: string[] = [];

    addresses = isDeep(pool.value)
      ? tokenTreeNodes(pool.value.tokens)
      : pool.value.tokensList;

    return removeAddress(pool.value.address, addresses);
  });

  // Token meta data for all relevant exit tokens including pool BPT.
  const exitTokenInfo = computed(
    (): TokenInfoMap =>
      getTokens([
        ...exitTokenAddresses.value,
        pool.value.address,
        ...amountsOut.value.map(ao => ao.address),
      ])
  );

  // All tokens extracted from the token tree, excl. pre-minted BPT.
  const exitTokens = computed((): PoolToken[] => {
    let tokens: PoolToken[] = [];

    tokens = isDeep(pool.value) ? flatTokenTree(pool.value) : pool.value.tokens;

    return tokens.filter(
      token => !isSameAddress(token.address, pool.value.address)
    );
  });

  // Amounts out to pass into exit functions
  const amountsOut = computed((): AmountOut[] => {
    if (isSingleAssetExit.value) return [singleAmountOut];
    return propAmountsOut.value;
  });

  // Is the single asset out value equal to it's maximum?
  const singleAssetMaxed = computed((): boolean => {
    return bnum(singleAmountOut.value).eq(singleAmountOut.max);
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

  // The type of exit to perform, is the user specifying the bptIn or the amount
  // of a token they want out?
  const exitType = computed((): ExitType => {
    if (isSingleAssetExit.value && !singleAssetMaxed.value)
      // It's a single asset exit but the user has not maximized the withdrawal.
      // So they are specifying an amount out.
      return ExitType.GivenOut;

    // It's either a single asset exit where the user has maxed their amount out
    // so we should use their BPT balance or it's a proportional exit and they
    // have specified bptIn via the slider.
    return ExitType.GivenIn;
  });

  // Internal bptIn value, some cases require bptBalance to be used when they
  // have maxed out the amountOut they want.
  const _bptIn = computed((): string => {
    if (isSingleAssetExit.value && singleAssetMaxed.value)
      // The user has chosen to withdraw the maximum they can in a single token
      // exit. To ensure no dust, use bptBalance.
      return bptBalance.value;

    return bptIn.value;
  });

  // The user's BPT balance.
  const bptBalance = computed((): string => balanceFor(pool.value.address));

  // User has a balance of BPT.
  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  // Checks if amountsIn has any values > 0.
  const hasAmountsOut = computed(() =>
    amountsOut.value.some(amountOut => bnum(amountOut.value).gt(0))
  );

  // Checks if BPT in is > 0
  const hasBptIn = computed(() => bnum(bptIn.value).gt(0));

  // Are amounts valid for transaction? That is bptIn and amountsOut.
  const validAmounts = computed((): boolean => {
    return isSingleAssetExit.value
      ? amountsOut.value.every(ao => ao.valid)
      : bptInValid.value;
  });

  // Map of amount out address to value as fiat amount.
  const fiatAmountsOut = computed((): Record<string, string> => {
    return Object.fromEntries(
      amountsOut.value.map(({ address, value }) => [
        address,
        toFiat(value, address),
      ])
    );
  });

  // Sum of all amountsOut fiat values.
  const fiatTotalOut = computed((): string => {
    return bnSum(Object.values(fiatAmountsOut.value)).toString();
  });

  const fiatValueIn = computed(() => fiatValueOf(pool.value, bptIn.value));

  /**
   * METHODS
   */

  /**
   * Simulate exit transaction to get expected output and calculate price impact.
   */
  async function queryExit() {
    if (!hasFetchedPoolsForSor.value) return;

    // Single asset exit, and token out amount is 0 or less
    if (isSingleAssetExit.value && !hasAmountsOut.value) return;

    // Proportional exit, and BPT in is 0 or less
    if (!isSingleAssetExit.value && !hasBptIn.value) return;

    exitPoolService.setExitHandler(exitHandlerType.value);

    // Invalidate previous query in order to prevent stale data
    queryClient.invalidateQueries(QUERY_EXIT_ROOT_KEY);

    try {
      const output = await exitPoolService.queryExit({
        exitType: exitType.value,
        bptIn: _bptIn.value,
        amountsOut: amountsOut.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        prices: prices.value,
      });

      priceImpact.value = output.priceImpact;
      propAmountsOut.value = Object.keys(output.amountsOut).map(address => ({
        address,
        value: output.amountsOut[address],
        max: '',
        valid: true,
      }));
    } catch (error) {
      captureException(error);
      throw new Error('Failed to construct exit.', { cause: error });
    }
  }

  /**
   * Fetch maximum amount out given bptBalance as bptIn.
   */
  async function getSingleAssetMax() {
    if (!hasFetchedPoolsForSor.value) return;
    if (!isSingleAssetExit.value) return;

    // If the user has not BPT, there is no maximum amount out.
    if (!hasBpt.value) return;

    const singleAssetMaxedExitHandler = shouldUseSwapExit.value
      ? ExitHandler.Swap
      : ExitHandler.ExactIn;

    exitPoolService.setExitHandler(singleAssetMaxedExitHandler);
    singleAmountOut.max = '';

    try {
      const output = await exitPoolService.queryExit({
        exitType: ExitType.GivenIn,
        bptIn: bptBalance.value,
        amountsOut: [singleAmountOut],
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        prices: prices.value,
        relayerSignature: '',
      });

      singleAmountOut.max =
        selectByAddress(output.amountsOut, singleAmountOut.address) || '0';
    } catch (error) {
      captureException(error);
      throw new Error('Failed to calculate max.', { cause: error });
    }
  }

  /**
   * Executes exit transaction.
   */
  async function exit(): Promise<TransactionResponse> {
    try {
      txError.value = '';
      exitPoolService.setExitHandler(exitHandlerType.value);

      return exitPoolService.exit({
        exitType: exitType.value,
        bptIn: _bptIn.value,
        amountsOut: amountsOut.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        prices: prices.value,
        relayerSignature: relayerSignature.value,
      });
    } catch (error) {
      txError.value = (error as Error).message;
      throw new Error('Failed to submit exit transaction.', { cause: error });
    }
  }

  function setInitialPropAmountsOut() {
    const leafNodes = tokenTreeLeafs(props.pool.tokens);
    propAmountsOut.value = leafNodes.map(address => ({
      address,
      value: '0',
      max: '',
      valid: true,
    }));
  }

  /**
   * WATCHERS
   */
  watch(isSingleAssetExit, _isSingleAssetExit => {
    bptIn.value = '';
    exitPoolService.setExitHandler(exitHandlerType.value);
    if (!_isSingleAssetExit) {
      setInitialPropAmountsOut();
    }
  });

  /**
   * LIFECYCLE
   */
  onBeforeMount(() => {
    // Ensure prices are fetched for token tree. When pool architecture is
    // refactoted probably won't be required.
    injectTokens([...exitTokenAddresses.value, pool.value.address]);

    exitPoolService.setExitHandler(exitHandlerType.value);

    if (!props.isSingleAssetExit) {
      setInitialPropAmountsOut();
    }
  });

  onMounted(() => {
    isMounted.value = true;
  });

  return {
    pool,
    isSingleAssetExit,
    singleAmountOut,
    propAmountsOut,
    exitTokenAddresses,
    exitTokens,
    priceImpact,
    isLoadingQuery,
    isLoadingMax,
    highPriceImpact,
    rektPriceImpact,
    hasAcceptedHighPriceImpact,
    highPriceImpactAccepted,
    txState,
    txInProgress,
    queryError,
    maxError,
    amountsOut,
    validAmounts,
    hasAmountsOut,
    bptBalance,
    hasBpt,
    bptIn,
    fiatTotalOut,
    fiatValueIn,
    fiatAmountsOut,
    exitTokenInfo,
    queryExitQuery,
    bptInValid,
    approvalActions,
    exit,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type Response = ReturnType<typeof provider>;
export const ExitPoolProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.ExitPool
);

/**
 * <ExitPoolProvider /> component.
 */
export const ExitPoolProvider = defineComponent({
  name: 'ExitPoolProvider',

  props: {
    pool: {
      type: Object as PropType<Pool>,
      required: true,
    },
    isSingleAssetExit: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    provide(ExitPoolProviderSymbol, provider(props));
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  },
});
