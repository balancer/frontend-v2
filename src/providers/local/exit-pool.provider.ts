import { isDeep, tokenTreeNodes } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { useTxState } from '@/composables/useTxState';
import useUserSettings from '@/composables/useUserSettings';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import symbolKeys from '@/constants/symbol.keys';
import { fetchPoolsForSor, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { bnum, removeAddress, trackLoading } from '@/lib/utils';
import { ExitPoolService } from '@/services/balancer/pools/exits/exit-pool.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
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
  const queryError = ref<string>('');
  const txError = ref<string>('');

  const debounceQueryExit = ref(debounce(queryExit, 1000, { leading: true }));

  /**
   * SERVICES
   */
  const exitPoolService = new ExitPoolService(pool);

  /**
   * COMPOSABLES
   */
  const { injectTokens } = useTokens();
  const { txState, txInProgress } = useTxState();
  const { slippageBsp } = useUserSettings();
  const { getSigner } = useWeb3();

  /**
   * COMPUTED
   */
  // All tokens in the pool token tree that can be used in exit functions.
  const exitTokens = computed((): string[] => {
    let addresses: string[] = [];

    addresses = isDeep(pool.value)
      ? tokenTreeNodes(pool.value.tokens)
      : pool.value.tokensList;

    return removeAddress(pool.value.address, addresses);
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

  /**
   * METHODS
   */

  /**
   * Simulate exit transaction to get expected output and calculate price impact.
   */
  async function queryExit() {
    trackLoading(async () => {
      try {
        const output = await exitPoolService.queryExit();
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
        signer: getSigner(),
        slippageBsp: slippageBsp.value,
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
  // If the global pool fetching for the SOR changes it's been set to true. In
  // this case we should re-trigger queryExit to fetch the expected output for
  // any existing input.
  watch(hasFetchedPoolsForSor, () => {
    debounceQueryExit.value();
  });

  watch(isSingleAssetExit, newVal => {
    queryError.value = '';
    exitPoolService.setExitHandler(newVal);
  });

  /**
   * LIFECYCLE
   */
  onBeforeMount(() => {
    // Ensure prices are fetched for token tree. When pool architecture is
    // refactoted probably won't be required.
    injectTokens(exitTokens.value);
    // Trigger SOR pool fetching in case swap exits are used.
    fetchPoolsForSor();
  });

  onBeforeUnmount(() => {
    debounceQueryExit.value.cancel();
  });

  return {
    pool,
    isSingleAssetExit,
    exitTokens,
    priceImpact,
    isLoadingQuery,
    highPriceImpact,
    rektPriceImpact,
    hasAcceptedHighPriceImpact,
    highPriceImpactAccepted,
    txState,
    txInProgress,
    debounceQueryExit,
    queryError,
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
