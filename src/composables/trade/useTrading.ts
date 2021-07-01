import { computed, onMounted, ref, Ref, watch } from 'vue';
import { useStore } from 'vuex';
import { BigNumber } from 'bignumber.js';
import { formatUnits } from '@ethersproject/units';
import { useIntervalFn } from '@vueuse/core';
import { SubgraphPoolBase } from '@balancer-labs/sor2';
import { Pool } from '@balancer-labs/sor/dist/types';
import { OrderKind } from '@gnosis.pm/gp-v2-contracts';

import { ETHER } from '@/constants/tokenlists';

import { bnum, bnumZero, scale } from '@/lib/utils';
import { unwrap, wrap } from '@/lib/utils/balancer/wrapper';

import {
  LiquiditySelection,
  SorManager,
  SorReturn
} from '@/lib/utils/balancer/helpers/sor/sorManager';
import getProvider from '@/lib/utils/provider';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';

import { FeeInformation } from '@/services/gnosis/types';
import { normalizeTokenAddress } from '@/services/gnosis/utils';
import {
  calculateValidTo,
  signOrder,
  UnsignedOrder
} from '@/services/gnosis/signing';
import { gnosisOperator } from '@/services/gnosis/operator.service';
import { configService } from '@/services/config/config.service';

import useNumbers from '../useNumbers';
import useTokens from '../useTokens';
import useWeb3 from '../useWeb3';
import useVueWeb3 from '@/services/web3/useVueWeb3';

export type TradeRoute = 'wrapETH' | 'unwrapETH' | 'balancer' | 'gnosis';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = process.env.VUE_APP_MAX_POOLS || '4';
const SWAP_COST = process.env.VUE_APP_SWAP_COST || '100000';
const MIN_PRICE_IMPACT = 0.0001;

// TODO: get app id
const GNOSIS_APP_ID = 2;
const appData = '0x' + GNOSIS_APP_ID.toString(16).padStart(64, '0');

export default function useTrading(
  tokenInAddressInput: Ref<string>,
  tokenInAmountInput: Ref<string>,
  tokenOutAddressInput: Ref<string>,
  tokenOutAmountInput: Ref<string>
) {
  // COMPOSABLES
  const store = useStore();
  const { fNum } = useNumbers();
  const { tokens } = useTokens();
  const { appNetwork, blockNumber, account } = useWeb3();
  const {
    getProvider: getWeb3Provider,
    userNetworkConfig,
    signer
  } = useVueWeb3();
  const provider = computed(() => getWeb3Provider());

  // DATA
  let sorManager: SorManager | undefined = undefined;
  const pools = ref<(Pool | SubgraphPoolBase)[]>([]);
  const sorReturn = ref<SorReturn>({
    isV1swap: false,
    isV1best: false,
    hasSwaps: false,
    tokenIn: '',
    tokenOut: '',
    returnDecimals: DEFAULT_TOKEN_DECIMALS,
    returnAmount: bnumZero,
    marketSpNormalised: bnumZero,
    v1result: [[], bnumZero, bnumZero],
    v2result: {
      tokenAddresses: [],
      swaps: [],
      swapAmount: bnumZero,
      returnAmount: bnumZero,
      returnAmountConsideringFees: bnumZero,
      tokenIn: '',
      tokenOut: '',
      marketSp: bnumZero
    }
  });
  const poolsLoading = ref(true);
  const feeQuote = ref<FeeInformation | null>(null);
  const feeExceedsPrice = ref(false);
  const orderId = ref('');
  const updatingQuotes = ref(false);
  const trading = ref(false);
  const priceImpact = ref(0);
  const exactIn = ref(true);

  function getConfig() {
    return store.getters['web3/getConfig']();
  }

  // COMPUTED
  const isWrap = computed(() => {
    const config = getConfig();
    return (
      tokenInAddressInput.value === ETHER.address &&
      tokenOutAddressInput.value === config.addresses.weth
    );
  });

  const tokenIn = computed(() => tokens.value[tokenInAddressInput.value]);

  const tokenOut = computed(() => tokens.value[tokenOutAddressInput.value]);

  const liquiditySelection = computed(() => store.state.app.tradeLiquidity);

  const isUnwrap = computed(() => {
    const config = getConfig();
    return (
      tokenOutAddressInput.value === ETHER.address &&
      tokenInAddressInput.value === config.addresses.weth
    );
  });

  const slippageBufferRate = computed(() =>
    parseFloat(store.state.app.slippage)
  );

  const feeAmountInTokenScaled = computed(() => feeQuote.value?.amount ?? '0');
  const feeAmountOutTokenScaled = computed(() =>
    tokenOutAmountScaled.value
      .div(tokenInAmountScaled.value)
      .times(feeAmountInTokenScaled.value)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()
  );

  const maximumInAmountScaled = computed(() =>
    tokenInAmountScaled.value
      .plus(feeAmountInTokenScaled.value)
      .times(1 + slippageBufferRate.value)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()
  );

  const minimumOutAmountScaled = computed(() =>
    tokenOutAmountScaled.value
      .minus(feeAmountOutTokenScaled.value)
      .div(1 + slippageBufferRate.value)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()
  );

  const appTransactionDeadline = computed<number>(
    () => store.state.app.transactionDeadline
  );

  const orderKind = computed(
    () => (exactIn.value ? OrderKind.SELL : OrderKind.BUY) as OrderKind
  );

  const isEthTrade = computed(
    () => tokenInAddressInput.value === ETHER.address
  );

  const tokenInAmountScaled = computed(() =>
    scale(bnum(tokenInAmountInput.value), tokenIn.value.decimals)
  );

  const tokenOutAmountScaled = computed(() =>
    scale(bnum(tokenOutAmountInput.value), tokenOut.value.decimals)
  );

  const requiresApproval = computed(() => {
    if (isWrap.value || isUnwrap.value || isEthTrade.value) {
      return false;
    }
    return true;
  });

  const effectivePriceMessage = computed(() => ({
    tokenIn: `1 ${tokenIn.value?.symbol} = ${fNum(
      tokenOutAmountScaled.value.div(tokenInAmountScaled.value).toString(),
      'token'
    )} ${tokenOut.value?.symbol}`,
    tokenOut: `1 ${tokenOut.value?.symbol} = ${fNum(
      tokenInAmountScaled.value.div(tokenOutAmountScaled.value).toString(),
      'token'
    )} ${tokenIn.value?.symbol}`
  }));

  const tradeRoute = computed<TradeRoute>(() => {
    if (isUnwrap.value) {
      return 'unwrapETH';
    }
    if (isWrap.value) {
      return 'wrapETH';
    }
    if (isEthTrade.value) {
      return 'balancer';
    }
    return 'gnosis';
  });

  useIntervalFn(async () => {
    if (tradeRoute.value === 'balancer') {
      if (sorManager) {
        fetchPools();
      }
    }
  }, 30 * 1e3);

  async function fetchPools(): Promise<void> {
    if (!sorManager) {
      return;
    }

    console.time('[SOR] fetchPools');
    await sorManager.fetchPools();
    console.timeEnd('[SOR] fetchPools');
    poolsLoading.value = false;
  }

  async function handleAmountChange(): Promise<void> {
    const amount = exactIn.value
      ? tokenInAmountInput.value
      : tokenOutAmountInput.value;
    // Avoid using SOR if querying a zero value or (un)wrapping trade
    const zeroValueTrade = amount === '' || bnum(amount).isZero();
    if (zeroValueTrade) {
      tokenInAmountInput.value = amount;
      tokenOutAmountInput.value = amount;
      priceImpact.value = 0;
      sorReturn.value.hasSwaps = false;
      sorReturn.value.returnAmount = bnumZero;
      return;
    }

    if (isWrap.value || isUnwrap.value) {
      tokenInAmountInput.value = amount;
      tokenOutAmountInput.value = amount;
      sorReturn.value.hasSwaps = false;
      priceImpact.value = 0;
      return;
    }

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;

    if (
      !tokenInAddress ||
      !tokenOutAddress ||
      !sorManager ||
      !sorManager.hasPoolData()
    ) {
      if (exactIn.value) tokenOutAmountInput.value = '';
      else tokenInAmountInput.value = '';
      return;
    }

    const tokenInDecimals = tokenIn.value?.decimals;
    const tokenOutDecimals = tokenOut.value?.decimals;

    if (exactIn.value) {
      await setSwapCost(
        tokenOutAddressInput.value,
        tokenOutDecimals,
        sorManager
      );

      const tokenInAmountNormalised = bnum(amount); // Normalized value
      const tokenInAmountScaled = scale(
        tokenInAmountNormalised,
        tokenInDecimals
      );

      console.log('[SOR Manager] swapExactIn');

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        'swapExactIn',
        tokenInAmountScaled,
        tokenInDecimals,
        liquiditySelection.value
      );

      sorReturn.value = swapReturn; // TO DO - is it needed?
      const tokenOutAmountNormalised = scale(
        swapReturn.returnAmount,
        -tokenOutDecimals
      );
      tokenOutAmountInput.value =
        tokenOutAmountNormalised.toNumber() > 0
          ? tokenOutAmountNormalised.toFixed(6, BigNumber.ROUND_DOWN)
          : '';

      if (!sorReturn.value.hasSwaps) {
        priceImpact.value = 0;
      } else {
        const returnAmtNormalised = scale(
          swapReturn.returnAmount,
          -tokenOutDecimals
        );
        const effectivePrice = tokenInAmountNormalised.div(returnAmtNormalised);
        const priceImpactCalc = effectivePrice
          .div(swapReturn.marketSpNormalised)
          .minus(1);

        priceImpact.value = BigNumber.max(
          priceImpactCalc,
          MIN_PRICE_IMPACT
        ).toNumber();
      }
    } else {
      // Notice that outputToken is tokenOut if swapType == 'swapExactIn' and tokenIn if swapType == 'swapExactOut'
      await setSwapCost(tokenInAddressInput.value, tokenInDecimals, sorManager);

      const tokenOutAmountNormalised = new BigNumber(amount);
      const tokenOutAmount = scale(tokenOutAmountNormalised, tokenOutDecimals);

      console.log('[SOR Manager] swapExactOut');

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        'swapExactOut',
        tokenOutAmount,
        tokenOutDecimals,
        liquiditySelection.value
      );

      sorReturn.value = swapReturn; // TO DO - is it needed?

      const tradeAmount: BigNumber = swapReturn.returnAmount;
      const tokenInAmountNormalised = scale(tradeAmount, -tokenInDecimals);
      tokenInAmountInput.value =
        tokenInAmountNormalised.toNumber() > 0
          ? tokenInAmountNormalised.toFixed(6, BigNumber.ROUND_UP)
          : '';

      if (!sorReturn.value.hasSwaps) {
        priceImpact.value = 0;
      } else {
        const effectivePrice = tokenInAmountNormalised.div(
          tokenOutAmountNormalised
        );
        const priceImpactCalc = effectivePrice
          .div(swapReturn.marketSpNormalised)
          .minus(1);

        priceImpact.value = BigNumber.max(
          priceImpactCalc,
          MIN_PRICE_IMPACT
        ).toNumber();
      }
    }

    pools.value = sorManager.selectedPools;
  }

  // Uses stored market prices to calculate swap cost in token denomination
  function calculateSwapCost(tokenAddress: string) {
    const ethPriceUsd =
      store.state.market.prices[ETHER.address.toLowerCase()]?.price || 0;
    const tokenPriceUsd =
      store.state.market.prices[tokenAddress.toLowerCase()]?.price || 0;
    const gasPriceWei = store.state.market.gasPrice || 0;
    const gasPriceScaled = scale(bnum(gasPriceWei), -18);
    const ethPriceToken = bnum(Number(ethPriceUsd) / Number(tokenPriceUsd));
    const swapCost = bnum(SWAP_COST);
    const costSwapToken = gasPriceScaled.times(swapCost).times(ethPriceToken);

    return costSwapToken;
  }

  // Sets SOR swap cost for more efficient routing
  async function setSwapCost(
    tokenAddress: string,
    tokenDecimals: number,
    sorManager: SorManager
  ): Promise<void> {
    const { chainId } = getConfig();
    // If using Polygon get price of swap using stored market prices
    // If mainnet price retrieved on-chain using SOR
    if (chainId === 137) {
      const swapCostToken = calculateSwapCost(tokenOutAddressInput.value);
      await sorManager.setCostOutputToken(
        tokenAddress,
        tokenDecimals,
        swapCostToken
      );
    } else {
      await sorManager.setCostOutputToken(tokenAddress, tokenDecimals);
    }
  }

  async function wrapETH() {
    try {
      trading.value = true;

      const tx = await wrap(
        String(userNetworkConfig.value.chainId),
        provider.value as any,
        tokenInAmountScaled.value
      );
      console.log(tx);
    } catch (e) {
      console.log(e);
      trading.value = false;
    }
  }

  async function unwrapETH() {
    try {
      trading.value = true;

      const tx = await unwrap(
        String(userNetworkConfig.value.chainId),
        provider.value as any,
        tokenInAmountScaled.value
      );

      console.log(tx);
    } catch (e) {
      console.log(e);
      trading.value = false;
    }
  }

  async function submitGnosisOrder() {
    try {
      trading.value = true;

      const unsignedOrder: UnsignedOrder = {
        sellToken: normalizeTokenAddress(tokenInAddressInput.value),
        buyToken: normalizeTokenAddress(tokenOutAddressInput.value),
        sellAmount: bnum(
          exactIn.value
            ? tokenInAmountScaled.value
            : maximumInAmountScaled.value
        )
          .minus(feeAmountInTokenScaled.value)
          .toString(),
        buyAmount: exactIn.value
          ? minimumOutAmountScaled.value
          : tokenOutAmountScaled.value.toString(),
        validTo: calculateValidTo(appTransactionDeadline.value),
        appData,
        feeAmount: feeAmountInTokenScaled.value,
        kind: orderKind.value,
        receiver: account.value,
        partiallyFillable: false // Always fill or kill
      };

      const { signature, signingScheme } = await signOrder(
        unsignedOrder,
        provider.value.getSigner()
      );

      orderId.value = await gnosisOperator.postSignedOrder({
        order: {
          ...unsignedOrder,
          signature,
          receiver: account.value,
          signingScheme
        },
        owner: account.value
      });
    } catch (e) {
      console.log(e);
      trading.value = false;
    }
  }

  function trade() {
    switch (tradeRoute.value) {
      case 'wrapETH': {
        wrapETH();
        break;
      }
      case 'unwrapETH': {
        unwrapETH();
        break;
      }
      case 'balancer': {
        console.log('balancer trade');
        break;
      }
      case 'gnosis': {
        submitGnosisOrder();
        break;
      }
      default:
        throw new Error(`Error: unsupported trade type ${tradeRoute.value}`);
    }
  }

  function isValidTokenAmount(tokenAmount: string) {
    return parseFloat(tokenAmount) > 0 && tokenAmount.trim() !== '';
  }

  async function updateGnosisQuotes() {
    if (
      isValidTokenAmount(
        exactIn.value ? tokenInAmountInput.value : tokenOutAmountInput.value
      )
    ) {
      const sellToken = tokenInAddressInput.value;
      const buyToken = tokenOutAddressInput.value;
      const kind = orderKind.value;
      const amountToExchange = exactIn.value
        ? tokenInAmountScaled.value
        : tokenOutAmountScaled.value;

      updatingQuotes.value = true;
      feeExceedsPrice.value = false;

      try {
        const queryParams = {
          sellToken,
          buyToken,
          amount: amountToExchange.toString(),
          kind
        };
        // TODO: there is a chance to optimize here and not make a new request if the fee is not expired
        const feeQuoteResult = await gnosisOperator.getFeeQuote(queryParams);

        if (feeQuoteResult != null) {
          if (exactIn.value) {
            feeExceedsPrice.value = amountToExchange
              .minus(feeQuoteResult.amount)
              .isNegative();
          }
          if (!feeExceedsPrice.value) {
            const priceQuoteResult = await gnosisOperator.getPriceQuote(
              queryParams
            );

            if (priceQuoteResult != null && priceQuoteResult.amount != null) {
              feeQuote.value = feeQuoteResult;

              if (exactIn.value) {
                tokenOutAmountInput.value = formatUnits(
                  priceQuoteResult.amount,
                  tokenOut.value.decimals
                );
              } else {
                tokenInAmountInput.value = formatUnits(
                  priceQuoteResult.amount,
                  tokenIn.value.decimals
                );
              }
            }
          }
        }
      } catch (e) {
        console.log('[Gnosis Quotes] Failed to update quotes', e);
      }
      updatingQuotes.value = false;
    }
  }

  async function initSor(): Promise<void> {
    const config = getConfig();
    const poolsUrlV1 = `${config.poolsUrlV1}?timestamp=${Date.now()}`;
    const poolsUrlV2 = `${config.poolsUrlV2}?timestamp=${Date.now()}`;
    const subgraphUrl = configService.network.subgraph;

    // If V1 previously selected on another network then it uses this and returns no liquidity.
    if (!appNetwork.supportsV1) {
      store.commit('app/setTradeLiquidity', LiquiditySelection.V2);
    }

    sorManager = new SorManager(
      getProvider(config.chainId),
      bnum(GAS_PRICE),
      Number(MAX_POOLS),
      config.chainId,
      config.addresses.weth,
      poolsUrlV1,
      poolsUrlV2,
      subgraphUrl
    );

    fetchPools();
  }

  // WATCHERS
  watch(liquiditySelection, () => {
    if (tradeRoute.value === 'balancer') {
      // When the liquidity type is changed we need to update the trade to use that selection
      handleAmountChange();
    }
  });

  watch(tokenInAddressInput, async () => {
    store.commit('trade/setInputAsset', tokenInAddressInput.value);

    if (tradeRoute.value === 'gnosis') {
      feeQuote.value = null;
      updateGnosisQuotes();
    } else {
      handleAmountChange();
    }
  });

  watch(tokenOutAddressInput, () => {
    store.commit('trade/setOutputAsset', tokenOutAddressInput.value);

    if (tradeRoute.value === 'gnosis') {
      feeQuote.value = null;
      updateGnosisQuotes();
    } else {
      handleAmountChange();
    }
  });

  watch(tokenInAmountInput, () => {
    if (tradeRoute.value === 'gnosis') {
      if (tokenInAmountInput.value !== '') {
        updateGnosisQuotes();
      } else {
        tokenOutAmountInput.value = '';
      }
    } else {
      handleAmountChange();
    }
  });

  watch(tokenOutAmountInput, () => {
    if (tradeRoute.value === 'gnosis') {
      if (tokenOutAmountInput.value !== '') {
        updateGnosisQuotes();
      } else {
        tokenInAmountInput.value = '';
      }
    } else {
      handleAmountChange();
    }
  });

  watch(blockNumber, async () => {
    if (tradeRoute.value === 'gnosis') {
      updateGnosisQuotes();

      // if (orderId.value != '') {
      //   const order = await gnosisOperator.getOrder(orderId.value);
      //   if (isOrderFinalized(order)) {
      //     orderMetadata.value = order;
      //     trading.value = false;
      //     modalTradePreviewIsOpen.value = false;
      //   }
      // }
    }
  });

  // EVENTS
  onMounted(async () => {
    const unknownAssets: string[] = [];
    if (!tokenIn.value) {
      unknownAssets.push(tokenInAddressInput.value);
    }
    if (!tokenOut.value) {
      unknownAssets.push(tokenOutAddressInput.value);
    }
    await store.dispatch('registry/injectTokens', unknownAssets);
    await initSor();
  });

  return {
    // methods
    getConfig,

    // computed
    isWrap,
    isUnwrap,
    isEthTrade,
    tokenIn,
    tokenOut,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokens,
    requiresApproval,
    effectivePriceMessage,
    tradeRoute,
    exactIn,
    feeExceedsPrice,
    trading,
    feeAmountInTokenScaled,
    feeAmountOutTokenScaled,
    minimumOutAmountScaled,
    maximumInAmountScaled,
    trade
  };
}
