import { nextTick } from 'vue';
import useNumbers from '@/composables/useNumbers';
import {
  fiatValueOf,
  flatTokenTree,
  isComposableStableV1,
  isDeep,
  isPreMintedBptType,
  isRecoveryExitsOnly,
  tokenTreeLeafs,
  tokenTreeNodes,
} from '@/composables/usePoolHelpers';
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
import QUERY_KEYS from '@/constants/queryKeys';
import symbolKeys from '@/constants/symbol.keys';
import {
  bnSum,
  bnum,
  includesAddress,
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
import { UseQueryReturnType, useQuery } from '@tanstack/vue-query';
import debounce from 'debounce-promise';
import { safeInject } from '../inject';
import { useApp } from '@/composables/useApp';
import { POOLS } from '@/constants/pools';
import { captureBalancerException } from '@/lib/utils/errors';

/**
 * TYPES
 */
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
export const exitPoolProvider = (
  pool: Ref<Pool>,
  debounceQueryExitMillis = 1000,
  debounceGetSingleAssetMaxMillis = 1000
) => {
  /**
   * STATE
   */
  const isMounted = ref(false);
  const isSingleAssetExit = ref<boolean>(false);
  const priceImpact = ref<number>(0);
  const priceImpactValid = ref<boolean>(true);
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
  const isTxPayloadReady = ref<boolean>(false);

  /**
   * SERVICES
   */
  const exitPoolService = new ExitPoolService(pool);

  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { injectTokens, getTokens, balanceFor } = useTokens();
  const { txState, txInProgress } = useTxState();
  const { transactionDeadline } = useApp();
  const { slippageBsp } = useUserSettings();
  const { account, getSigner } = useWeb3();
  const { relayerSignature, relayerApprovalAction, relayerApprovalTx } =
    useRelayerApproval(RelayerType.BATCH);

  const debounceQueryExit = debounce(queryExit, debounceQueryExitMillis);
  const debounceGetSingleAssetMax = debounce(
    getSingleAssetMax,
    debounceGetSingleAssetMaxMillis,
    {
      leading: true,
    }
  );

  const queriesEnabled = computed(
    (): boolean => isMounted.value && !txInProgress.value
  );

  // The user's BPT balance.
  const bptBalance = computed((): string => balanceFor(pool.value.address));

  const queryExitQuery = useQuery<
    Awaited<ReturnType<typeof debounceQueryExit>>,
    Error
  >(
    QUERY_KEYS.Pools.Exits.QueryExit(
      account,
      bptIn,
      isSingleAssetExit,
      singleAmountOut,
      relayerSignature
    ),
    debounceQueryExit,
    reactive({ enabled: queriesEnabled, refetchOnWindowFocus: false })
  );

  const singleAssetMaxQuery = useQuery<
    Awaited<ReturnType<typeof debounceGetSingleAssetMax>>,
    Error
  >(
    QUERY_KEYS.Pools.Exits.SingleAssetMax(
      bptBalance,
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
    (): boolean => queryExitQuery.isFetching.value
  );

  const queryError = computed(
    (): string | undefined => queryExitQuery.error.value?.message
  );

  const isLoadingMax = computed(
    (): boolean => singleAssetMaxQuery.isFetching.value || !queriesEnabled.value
  );

  const maxError = computed(
    (): string | undefined => singleAssetMaxQuery.error.value?.message
  );

  const isDeepPool = computed((): boolean => isDeep(pool.value));

  const shouldSignRelayer = computed(
    (): boolean =>
      exitHandlerType.value === ExitHandler.Generalised &&
      // Check if Batch Relayer is either approved, or signed
      !(relayerApprovalTx.isUnlocked.value || relayerSignature.value)
  );

  const approvalActions = computed((): TransactionActionInfo[] =>
    shouldSignRelayer.value ? [relayerApprovalAction.value] : []
  );

  const canSwapExit = computed(
    (): boolean => isDeep(pool.value) && isPreMintedBptType(pool.value.poolType)
  );

  const shouldUseSwapExit = computed(
    (): boolean =>
      isSingleAssetExit.value &&
      !includesAddress(pool.value.tokensList, singleAmountOut.address) &&
      canSwapExit.value
  );

  const shouldUseGeneralisedExit = computed(
    (): boolean =>
      !isSingleAssetExit.value &&
      (isDeep(pool.value) || isComposableStableV1(pool.value))
  );

  // Should exit via internal balance only in unique cases.
  // e.g. exiting the Euler linear pools.
  const shouldExitViaInternalBalance = computed(
    (): boolean =>
      !!POOLS.ExitViaInternalBalance &&
      POOLS.ExitViaInternalBalance.includes(pool.value.id)
  );

  const shouldUseRecoveryExit = computed((): boolean =>
    isRecoveryExitsOnly(pool.value)
  );

  const exitHandlerType = computed((): ExitHandler => {
    if (shouldUseRecoveryExit.value) return ExitHandler.Recovery;
    if (shouldUseSwapExit.value) return ExitHandler.Swap;
    if (shouldUseGeneralisedExit.value) return ExitHandler.Generalised;
    if (isSingleAssetExit.value) {
      // If 'max' is clicked we want to pass in the full bpt balance.
      if (singleAssetMaxed.value) return ExitHandler.ExactIn;
      return ExitHandler.ExactOut;
    }
    return ExitHandler.ExactIn;
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

  // User has a balance of BPT.
  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  // Checks if amountsIn has any values > 0.
  const hasAmountsOut = computed(() => {
    return amountsOut.value.some(amountOut => bnum(amountOut.value).gt(0));
  });

  // Checks if BPT in is > 0
  const hasBptIn = computed(() => bnum(bptIn.value).gt(0));

  // Are amounts valid for transaction? That is bptIn and amountsOut.
  const validAmounts = computed((): boolean => {
    return isSingleAssetExit.value
      ? amountsOut.value.every(ao => ao.valid && bnum(ao.value).gt(0))
      : bptInValid.value && bnum(bptIn.value).gt(0);
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
    // This is so we can render - in UI instead of 0. If we set to 0 then it can be misleading.
    priceImpactValid.value = false;

    // Single asset exit, and token out amount is 0 or less
    if (isSingleAssetExit.value && !validAmounts.value) return null;

    // Proportional exit, and BPT in is 0 or less
    if (!isSingleAssetExit.value && !hasBptIn.value) return null;

    exitPoolService.setExitHandler(exitHandlerType.value);

    console.log('exitHandler:', exitHandlerType.value);
    try {
      await nextTick();
      const output = await exitPoolService.queryExit({
        exitType: exitType.value,
        bptIn: _bptIn.value,
        amountsOut: amountsOut.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        approvalActions: approvalActions.value,
        bptInValid: bptInValid.value,
        relayerSignature: relayerSignature.value,
        transactionDeadline: transactionDeadline.value,
        toInternalBalance: shouldExitViaInternalBalance.value,
      });

      priceImpact.value = output.priceImpact;
      propAmountsOut.value = Object.keys(output.amountsOut).map(address => ({
        address,
        value: output.amountsOut[address],
        max: '',
        valid: true,
      }));
      isTxPayloadReady.value = output.txReady;

      priceImpactValid.value = true;
      return output;
    } catch (error) {
      logExitException(error as Error, queryExitQuery);
      throw new Error('Failed to construct exit.', { cause: error });
    }
  }

  /**
   * Fetch maximum amount out given bptBalance as bptIn.
   */
  async function getSingleAssetMax() {
    singleAmountOut.max = '0';
    if (!isSingleAssetExit.value) return null;

    // If the user has no BPT, there is no maximum amount out.
    if (!hasBpt.value) return null;

    const singleAssetMaxedExitHandler = shouldUseSwapExit.value
      ? ExitHandler.Swap
      : ExitHandler.ExactIn;

    exitPoolService.setExitHandler(singleAssetMaxedExitHandler);

    console.log('exitHandler:', exitHandlerType.value);
    try {
      await nextTick();
      const output = await exitPoolService.queryExit({
        exitType: ExitType.GivenIn,
        bptIn: bptBalance.value,
        amountsOut: [singleAmountOut],
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        approvalActions: approvalActions.value,
        bptInValid: bptInValid.value,
        relayerSignature: relayerSignature.value,
        transactionDeadline: transactionDeadline.value,
        toInternalBalance: shouldExitViaInternalBalance.value,
      });
      const newMax =
        selectByAddress(output.amountsOut, singleAmountOut.address) || '0';
      singleAmountOut.max = newMax;

      return newMax;
    } catch (error) {
      logExitException(error as Error, singleAssetMaxQuery);
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

      console.log('exitHandler:', exitHandlerType.value);
      return exitPoolService.exit({
        exitType: exitType.value,
        bptIn: _bptIn.value,
        amountsOut: amountsOut.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        approvalActions: approvalActions.value,
        bptInValid: bptInValid.value,
        relayerSignature: relayerSignature.value,
        transactionDeadline: transactionDeadline.value,
        toInternalBalance: shouldExitViaInternalBalance.value,
      });
    } catch (error) {
      logExitException(error as Error);
      txError.value = (error as Error).message;
      throw error;
    }
  }

  function setInitialPropAmountsOut() {
    const leafNodes: string[] = isDeepPool.value
      ? tokenTreeLeafs(pool.value.tokens)
      : pool.value.tokensList.filter(
          token => !isSameAddress(token, pool.value.address)
        );

    propAmountsOut.value = leafNodes.map(address => ({
      address,
      value: '0',
      max: '',
      valid: true,
    }));
  }

  function setIsSingleAssetExit(value: boolean) {
    isSingleAssetExit.value = value;
  }

  async function logExitException(
    error: Error,
    query?: UseQueryReturnType<any, any>
  ) {
    // Ignore error when queryExit fails once the tx has been confirmed
    if (txState.confirmed && queryError.value) return;

    const sender = await getSigner().getAddress();
    captureBalancerException({
      error,
      action: 'withdraw',
      query,
      context: {
        level: 'fatal',
        extra: {
          exitHandler: exitHandlerType.value,
          params: JSON.stringify(
            {
              exitType: exitType.value,
              bptIn: _bptIn.value,
              amountsOut: amountsOut.value,
              signer: sender,
              slippageBsp: slippageBsp.value,
              tokenInfo: exitTokenInfo.value,
              approvalActions: approvalActions.value,
              bptInValid: bptInValid.value,
              relayerSignature: relayerSignature.value,
              transactionDeadline: transactionDeadline.value,
              toInternalBalance: shouldExitViaInternalBalance.value,
            },
            null,
            2
          ),
        },
      },
    });
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
    // refactored probably won't be required.
    injectTokens([...exitTokenAddresses.value, pool.value.address]);

    exitPoolService.setExitHandler(exitHandlerType.value);

    if (!isSingleAssetExit.value) {
      setInitialPropAmountsOut();
    }
  });

  onMounted(() => {
    isMounted.value = true;
  });

  return {
    // state
    txState,
    singleAmountOut,
    highPriceImpactAccepted,
    bptIn,
    bptInValid,
    pool,
    isSingleAssetExit: readonly(isSingleAssetExit),
    propAmountsOut: readonly(propAmountsOut),
    priceImpact: readonly(priceImpact),
    priceImpactValid: readonly(priceImpactValid),
    exitPoolService,

    // computed
    exitTokenAddresses,
    exitTokens,
    isLoadingQuery,
    isLoadingMax,
    highPriceImpact,
    rektPriceImpact,
    hasAcceptedHighPriceImpact,
    txInProgress,
    queryError,
    maxError,
    amountsOut,
    validAmounts,
    hasAmountsOut,
    bptBalance,
    hasBpt,
    fiatTotalOut,
    fiatValueIn,
    fiatAmountsOut,
    exitTokenInfo,
    queryExitQuery,
    approvalActions,
    transactionDeadline,
    shouldExitViaInternalBalance,
    isTxPayloadReady,
    relayerSignature,
    relayerApprovalTx,
    shouldUseSwapExit,
    canSwapExit,
    shouldUseRecoveryExit,

    // methods
    setIsSingleAssetExit,
    exit,
  };
};

export type ExitPoolProviderResponse = ReturnType<typeof exitPoolProvider>;
export const ExitPoolProviderSymbol: InjectionKey<ExitPoolProviderResponse> =
  Symbol(symbolKeys.Providers.ExitPool);

export function provideExitPool(pool: Ref<Pool>) {
  const exitPoolResponse = exitPoolProvider(pool);
  provide(ExitPoolProviderSymbol, exitPoolResponse);
  return exitPoolResponse;
}

export function useExitPool(): ExitPoolProviderResponse {
  return safeInject(ExitPoolProviderSymbol);
}
