import useNumbers from '@/composables/useNumbers';
import { flatTokenTree, isDeep, tokenTreeNodes } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { useTxState } from '@/composables/useTxState';
import useUserSettings from '@/composables/useUserSettings';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import symbolKeys from '@/constants/symbol.keys';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import {
  bnSum,
  bnum,
  isSameAddress,
  removeAddress,
  trackLoading,
} from '@/lib/utils';
import { ExitPoolService } from '@/services/balancer/pools/exits/exit-pool.service';
import { ExitType } from '@/services/balancer/pools/exits/handlers/exit-pool.handler';
import { Pool, PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfoMap } from '@/types/TokenList';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { debounce } from 'lodash';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
  onBeforeMount,
  onBeforeUnmount,
  PropType,
  provide,
  ref,
  reactive,
  toRef,
  watch,
} from 'vue';

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
  const isSingleAssetExit = toRef(props, 'isSingleAssetExit');
  const priceImpact = ref<number>(0);
  const highPriceImpactAccepted = ref<boolean>(false);
  const isLoadingQuery = ref<boolean>(true);
  const isLoadingMax = ref<boolean>(true);
  const isLoadingSingleAssetMax = ref<boolean>(false);
  const bptIn = ref<string>('0');
  const queryError = ref<string>('');
  const maxError = ref<string>('');
  const txError = ref<string>('');
  const singleAmountOut = reactive<AmountOut>({
    address: '',
    value: '',
    max: '',
    valid: true,
  });

  const debounceQueryExit = ref(debounce(queryExit, 1000, { leading: true }));
  const debounceGetSingleAssetMax = ref(
    debounce(getSingleAssetMax, 1000, { leading: true })
  );

  /**
   * SERVICES
   */
  const exitPoolService = new ExitPoolService(pool);

  /**
   * COMPOSABLES
   */
  const { toFiat } = useNumbers();
  const { txState, txInProgress } = useTxState();
  const { slippageBsp } = useUserSettings();
  const { getSigner } = useWeb3();
  const { injectTokens, getTokens, prices, balanceFor } = useTokens();

  /**
   * COMPUTED
   */
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

    tokens = isDeep(pool.value)
      ? flatTokenTree(pool.value.tokens)
      : pool.value.tokens;

    return tokens.filter(
      token => !isSameAddress(token.address, pool.value.address)
    );
  });

  // Amounts out to pass into exit functions
  const amountsOut = computed((): AmountOut[] => {
    if (isSingleAssetExit.value) return [singleAmountOut];
    return [];
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

  // Are amounts valid for transaction? That is bptIn and amountsOut.
  const validAmounts = computed((): boolean => {
    return bnum(_bptIn.value).gt(0) && amountsOut.value.every(ao => ao.valid);
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

  /**
   * METHODS
   */

  /**
   * Simulate exit transaction to get expected output and calculate price impact.
   */
  async function queryExit() {
    if (!hasFetchedPoolsForSor.value) return;

    trackLoading(async () => {
      try {
        const output = await exitPoolService.queryExit({
          exitType: exitType.value,
          bptIn: _bptIn.value,
          amountsOut: amountsOut.value,
          signer: getSigner(),
          slippageBsp: slippageBsp.value,
          tokenInfo: exitTokenInfo.value,
          prices: prices.value,
          relayerSignature: '',
        });
        priceImpact.value = output.priceImpact;
        queryError.value = '';
      } catch (error) {
        console.log('error', error);
        queryError.value = (error as Error).message;
      }
    }, isLoadingQuery);
  }

  /**
   * Fetch maximum amount out given bptBalance as bptIn.
   */
  async function getSingleAssetMax() {
    if (!hasFetchedPoolsForSor.value) return;

    trackLoading(async () => {
      try {
        singleAmountOut.max = '';
        maxError.value = '';
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
        singleAmountOut.max = output.amountsOut[singleAmountOut.address];
        maxError.value = '';
      } catch (error) {
        console.error(error);
        maxError.value = (error as Error).message;
      }
    }, isLoadingMax);
  }

  /**
   * Executes exit transaction.
   */
  async function exit(): Promise<TransactionResponse> {
    try {
      return exitPoolService.exit({
        exitType: exitType.value,
        bptIn: _bptIn.value,
        amountsOut: amountsOut.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        prices: prices.value,
        relayerSignature: '',
      });
    } catch (error) {
      txError.value = (error as Error).message;
      throw error;
    }
  }

  /**
   * WATCHERS
   */
  // If bptIn changes refetch expected output.
  watch(bptIn, () => {
    debounceQueryExit.value();
  });

  // If the global pool fetching for the SOR changes it's been set to true. In
  // this case we should re-trigger queryExit to fetch the expected output for
  // any existing input.
  watch(hasFetchedPoolsForSor, () => {
    debounceQueryExit.value();
    debounceGetSingleAssetMax.value();
  });

  watch(isSingleAssetExit, _isSingleAssetExit => {
    bptIn.value = '';
    queryError.value = '';
    exitPoolService.setExitHandler(_isSingleAssetExit);
    debounceGetSingleAssetMax.value();
  });

  watch(
    () => singleAmountOut.address,
    async () => {
      await Promise.all([
        debounceGetSingleAssetMax.value,
        debounceQueryExit.value,
      ]);
    }
  );

  watch(
    () => singleAmountOut.value,
    () => debounceQueryExit.value()
  );

  /**
   * LIFECYCLE
   */
  onBeforeMount(() => {
    // Ensure prices are fetched for token tree. When pool architecture is
    // refactoted probably won't be required.
    injectTokens([...exitTokenAddresses.value, pool.value.address]);
    // Trigger SOR pool fetching in case swap exits are used.
    fetchPoolsForSor();
    exitPoolService.setExitHandler(isSingleAssetExit.value);
  });

  onBeforeUnmount(() => {
    debounceQueryExit.value.cancel();
  });

  return {
    pool,
    isSingleAssetExit,
    singleAmountOut,
    exitTokenAddresses,
    exitTokens,
    priceImpact,
    isLoadingQuery,
    isLoadingMax,
    isLoadingSingleAssetMax,
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
    fiatAmountsOut,
    debounceQueryExit,
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
