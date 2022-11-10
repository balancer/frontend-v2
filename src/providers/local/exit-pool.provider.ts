import useNumbers, { FNumFormats } from '@/composables/useNumbers';
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
import { bnum, isSameAddress, removeAddress, trackLoading } from '@/lib/utils';
import { ExitPoolService } from '@/services/balancer/pools/exits/exit-pool.service';
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
  const isLoadingQuery = ref<boolean>(false);
  const isLoadingSingleAssetMax = ref<boolean>(false);
  const bptIn = ref<string>('0');
  const bptValid = ref<boolean>(true);
  const queryError = ref<string>('');
  const txError = ref<string>('');
  const singleAmountOut = reactive<AmountOut>({
    address: '',
    value: '',
    max: '',
    valid: true,
  });

  const debounceQueryExit = ref(debounce(queryExit, 1000, { leading: true }));

  /**
   * SERVICES
   */
  const exitPoolService = new ExitPoolService(pool);

  /**
   * COMPOSABLES
   */
  const { fNum2 } = useNumbers();
  const { txState, txInProgress } = useTxState();
  const { slippageBsp } = useUserSettings();
  const { getSigner } = useWeb3();
  const { injectTokens, getTokens, prices, balanceFor, wrappedNativeAsset } =
    useTokens();

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

  // Checks if amountsIn has any values > 0.
  const hasAmountsOut = computed(() =>
    amountsOut.value.some(amountOut => bnum(amountOut.value).gt(0))
  );

  const bptBalance = computed((): string => balanceFor(pool.value.address));

  const hasBpt = computed(() => bnum(bptBalance.value).gt(0));

  // TODO
  const tokenOutPoolBalance = computed(() => {
    return '1';
  });

  // TODO
  const fiatTotal = computed((): string => '0');

  const fiatTotalLabel = computed((): string =>
    fNum2(fiatTotal.value, FNumFormats.fiat)
  );

  // TODO
  const fiatAmounts = computed((): string[] => ['0', '1']);

  // TODO
  const proportionalAmounts = computed((): string[] => {
    return ['0', '1'];
  });

  // TODO
  const fullAmounts = computed(() => {
    return ['0', '1'];
  });

  /**
   * METHODS
   */
  function setDefaultSingleAmountOut() {}

  /**
   * Simulate exit transaction to get expected output and calculate price impact.
   */
  async function queryExit() {
    trackLoading(async () => {
      try {
        const output = await exitPoolService.queryExit({
          bptIn: bptIn.value,
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
        queryError.value = (error as Error).message;
      }
    }, isLoadingQuery);
  }

  /**
   * Executes exit transaction.
   */
  async function exit(): Promise<TransactionResponse> {
    try {
      return exitPoolService.exit({
        bptIn: '0',
        amountsOut: amountsOut.value,
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
        tokenInfo: exitTokenInfo.value,
        prices: prices.value,
        relayerSignature: '',
      });
      throw new Error('To be implemented');
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
  });

  watch(isSingleAssetExit, _isSingleAssetExit => {
    bptIn.value = '';
    queryError.value = '';
    exitPoolService.setExitHandler(_isSingleAssetExit);
  });

  /**
   * LIFECYCLE
   */
  onBeforeMount(() => {
    // Ensure prices are fetched for token tree. When pool architecture is
    // refactoted probably won't be required.
    injectTokens([...exitTokenAddresses.value, pool.value.address]);
    // Trigger SOR pool fetching in case swap exits are used.
    fetchPoolsForSor();
    setDefaultSingleAmountOut();
  });

  onBeforeUnmount(() => {
    debounceQueryExit.value.cancel();
  });

  return {
    pool,
    isSingleAssetExit,
    exitTokenAddresses,
    exitTokens,
    priceImpact,
    isLoadingQuery,
    isLoadingSingleAssetMax,
    highPriceImpact,
    rektPriceImpact,
    hasAcceptedHighPriceImpact,
    highPriceImpactAccepted,
    txState,
    txInProgress,
    queryError,
    amountsOut,
    hasAmountsOut,
    bptBalance,
    tokenOutPoolBalance,
    hasBpt,
    bptIn,
    bptValid,
    fiatTotalLabel,
    fiatAmounts,
    proportionalAmounts,
    fullAmounts,
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
