// import JoinPool from '@/components/forms/pool_actions/JoinPool';
import { isDeep, tokenTreeNodes } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';
import {
  HIGH_PRICE_IMPACT,
  REKT_PRICE_IMPACT,
} from '@/constants/poolLiquidity';
import symbolKeys from '@/constants/symbol.keys';
import { balancer } from '@/lib/balancer.sdk';
import { bnum, isSameAddress, removeAddress } from '@/lib/utils';
import { AnyPool, Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenAmountMap } from '@/types';
import { SwapInfo } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { add, debounce } from 'lodash';
import { Address } from 'paraswap';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
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
type AmountIn = {
  address: string;
  value: string;
  valid: boolean;
};

type FormState = {
  amountsIn: AmountIn[];
  propAmounts: string[];
  highPriceImpactAccepted: boolean;
  submitting: boolean;
  sorReady: boolean;
};

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
  const { getToken } = useTokens();
  const { slippageBsp } = useUserSettings();
  const { account, blockNumber } = useWeb3();

  /**
   * SERVICES
   */
  // const joinPool = new JoinPool(pool.value.id, pool.value.address, 18);
  // const sor = balancer.sor;

  /**
   * STATE
   */
  const form = reactive<FormState>({
    amountsIn: [],
    propAmounts: [],
    highPriceImpactAccepted: false,
    submitting: false,
    sorReady: false,
  });
  const amountsIn = ref<AmountIn[]>([]);
  // const swapRoute = ref<SwapInfo | null>(null);
  const bptOut = ref<string>('');
  const fiatValueIn = ref<string>('');
  const fiatValueOut = ref<string>('');
  // const priceImpact = ref<number>(0);
  // const transactionInProgress = ref<boolean>(false);
  // const loadingData = ref(false);
  // const debouncedFindSwapRoute = ref(debounce(findSwapRoute, 1000));

  /**
   * COMPUTED
   */
  // All investable tokens in the pool's token tree.
  const poolTokenAddresses = computed((): string[] => {
    let addresses: string[] = [];

    addresses = isDeep(pool) ? tokenTreeNodes(pool.tokens) : pool.tokensList;

    return removeAddress(pool.address, addresses);
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
      amountsIn.value.push({ address, value: '0', valid: true })
    );
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

  // async function findSwapRoute() {
  //   if (!form.amounts[0]) return;
  //   if (!pool.value) return;
  //   loadingData.value = true;

  //   fiatValueIn.value = joinPool.getFiatValueIn(
  //     form.amounts,
  //     form.tokenAddresses
  //   );

  //   const token = getToken(form.tokenAddresses[0]);

  //   const {
  //     route,
  //     fiatValueOut: _fiatValueOut,
  //     bptOut: _bptOut,
  //     priceImpact: _priceImpact,
  //   } = await joinPool
  //     .findRouteGivenIn(
  //       form.tokenAddresses[0],
  //       form.amounts[0],
  //       token?.decimals || 18,
  //       pool.value
  //     )
  //     .finally(() => (loadingData.value = false));

  //   // Update state variables
  //   fiatValueOut.value = _fiatValueOut;
  //   bptOut.value = _bptOut;
  //   swapRoute.value = route;
  //   priceImpact.value = _priceImpact;

  //   // console.log({
  //   //   route,
  //   //   bptOut,
  //   //   fiatValueIn,
  //   //   fiatValueOut,
  //   //   priceImpact,
  //   //   swapAttributes,
  //   //   priceImpactPct: priceImpact.value * 100,
  //   //   returnAmount: route.returnAmount.toString(),
  //   //   returnAmountConsideringFees: route.returnAmountConsideringFees.toString(),
  //   //   returnAmountFromSwaps: route.returnAmountFromSwaps.toString(),
  //   //   swapAmount: route.swapAmount.toString(),
  //   //   swapAmountForSwaps: route.swapAmountForSwaps.toString(),
  //   // });
  // }

  /**
   * WATCHERS
   */
  // watch(
  //   amountsIn,
  //   newAmountsIn => {
  //     console.log('newAmountsIn', newAmountsIn);
  //     // debouncedFindSwapRoute.value();
  //   },
  //   { deep: true }
  // );

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

  return {
    pool,
    form,
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
