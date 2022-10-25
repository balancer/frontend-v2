// import JoinPool from '@/components/forms/pool_actions/JoinPool';
import { isDeep, tokenTreeNodes } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import symbolKeys from '@/constants/symbol.keys';
import { balancer, fetchPoolsForSor } from '@/lib/balancer.sdk';
import { bnum, isSameAddress, removeAddress } from '@/lib/utils';
import { JoinPoolService } from '@/services/balancer/pools/joins/join-pool.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { AnyPool, Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenAmountMap } from '@/types';
import { TokenInfoMap } from '@/types/TokenList';
import { SwapInfo } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { add, debounce } from 'lodash';
import { Address } from 'paraswap';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
  onBeforeMount,
  onBeforeUnmount,
  PropType,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';

/**
 * TYPES
 */
// type FormState = {
//   amountsIn: Record<Address, string>;
//   validInputs: Record<Address, boolean>;
//   highPriceImpactAccepted: boolean;
// };
export type AmountIn = {
  address: string;
  value: string;
  valid: boolean;
};

// type FormState = {
//   amountsIn: AmountIn[];
//   propAmounts: string[];
//   highPriceImpactAccepted: boolean;
//   submitting: boolean;
//   sorReady: boolean;
// };

type Props = {
  pool: Pool;
};

/**
 * JoinPoolProvider
 *
 * Handles pool joining state and transaction building.
 */
const provider = ({ pool }: Props) => {
  /**
   * COMPOSABLES
   */
  const { getToken, getTokens, prices, injectTokens } = useTokens();
  const { slippageBsp } = useUserSettings();
  const { account, blockNumber } = useWeb3();

  /**
   * SERVICES
   */
  const joinPoolService = new JoinPoolService(pool);
  // const joinPool = new JoinPool(pool.value.id, pool.value.address, 18);
  // const sor = balancer.sor;

  /**
   * STATE
   */
  // const form = reactive<FormState>({
  //   amountsIn: [],
  //   propAmounts: [],
  //   highPriceImpactAccepted: false,
  //   submitting: false,
  //   sorReady: false,
  // });
  const amountsIn = ref<AmountIn[]>([]);
  // const swapRoute = ref<SwapInfo | null>(null);
  const bptOut = ref<string>('');
  const fiatValueIn = ref<string>('');
  const fiatValueOut = ref<string>('');
  // const priceImpact = ref<number>(0);
  // const transactionInProgress = ref<boolean>(false);
  // const loadingData = ref(false);
  const debounceQueryJoin = ref(debounce(queryJoin, 1000));

  /**
   * COMPUTED
   */
  // All investable tokens in the pool's token tree.
  const poolTokenAddresses = computed((): string[] => {
    let addresses: string[] = [];

    addresses = isDeep(pool) ? tokenTreeNodes(pool.tokens) : pool.tokensList;

    return removeAddress(pool.address, addresses);
  });

  // Token meta data for amountsIn tokens.
  const tokensIn = computed((): TokenInfoMap => {
    return getTokens(amountsIn.value.map(a => a.address));
  });

  // })
  // const highPriceImpact = computed<boolean>(() => {
  //   return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
  // });

  // const rektPriceImpact = computed<boolean>(() => {
  //   return bnum(priceImpact.value).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT);
  // });

  // const tokenCount = computed<number>(() => form.tokensIn.length);

  // const fullAmounts = computed<string[]>(() =>
  //   new Array(tokenCount.value)
  //     .fill('0')
  //     .map((_, i) => form.amountsIn[i] || '0')
  // );

  // const hasAmounts = computed(() =>
  //   fullAmounts.value.some(amount => bnum(amount).gt(0))
  // );

  /**
   * METHODS
   */

  /**
   * Mutates token>amount map in form state.
   *
   * @param {TokenAmountMap} amounts - Map of token addresses and amounts.
   */
  function setAmountsIn(_amountsIn: AmountIn[]) {
    amountsIn.value = _amountsIn;
  }

  /**
   * Mutates single input token amount in form state.
   *
   * @param {string} amount - Normalised (non-evm) token amount.
   */
  function setAmountIn(amountIn: AmountIn) {
    const index = amountsIn.value.findIndex(a =>
      isSameAddress(a.address, amountIn.address)
    );
    amountsIn.value[index] = amountIn;
  }

  /**
   * Adds amountsIn with value 0 for array of token addresses.
   *
   * @param {string[]} tokensIn - Array of token addresses.
   */
  function addTokensIn(tokensIn: string[]) {
    tokensIn.forEach(address =>
      amountsIn.value.push({ address, value: '', valid: true })
    );
  }

  /**
   * Simulate join transaction to get expected output and calculate price impact.
   */
  async function queryJoin() {
    const res = await joinPoolService.queryJoin(
      amountsIn.value,
      tokensIn.value,
      prices.value
    );
    console.log('QUERY', res);
  }

  // async function join(): Promise<TransactionResponse> {
  //   if (!account.value) throw new Error('Connect your account');
  //   if (!swapRoute.value) await findSwapRoute();
  //   transactionInProgress.value = true;
  //   const tx = await joinPool
  //     .join(swapRoute.value as SwapInfo, slippageBsp.value, account.value)
  //     .finally(() => {
  //       transactionInProgress.value = false;
  //     });
  //   return tx;
  // }

  /**
   * WATCHERS
   */
  watch(
    amountsIn,
    () => {
      debounceQueryJoin.value();
    },
    { deep: true }
  );

  // watch(blockNumber, () => {
  //   if (!loadingData.value && !transactionInProgress.value) {
  //     console.log('block number changed');
  //     findSwapRoute();
  //   }
  // });

  // watch(fullAmounts, async (newAmounts, oldAmounts) => {
  //   const changedIndex = newAmounts.findIndex(
  //     (amount, i) => oldAmounts[i] !== amount
  //   );

  //   if (changedIndex >= 0) {
  //     debouncedFindSwapRoute.value();
  //   }
  // });

  /**
   * LIFECYCLE
   */
  onBeforeMount(() => {
    // Ensure prices are fetched for token tree. When pool architecture is
    // refactoted probably won't be required.
    injectTokens(poolTokenAddresses.value);
    // Trigger SOR pool fetching in case swap joins are used.
    fetchPoolsForSor();
  });

  onBeforeUnmount(() => {
    debounceQueryJoin.value.cancel();
  });

  return {
    pool,
    amountsIn,
    poolTokenAddresses,
    bptOut,
    fiatValueIn,
    fiatValueOut,
    // highPriceImpact,
    setAmountsIn,
    setAmountIn,
    addTokensIn,
    // findSwapRoute,
    // join,
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
  },

  setup(props) {
    provide(JoinPoolProviderSymbol, provider(props));
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  },
});
