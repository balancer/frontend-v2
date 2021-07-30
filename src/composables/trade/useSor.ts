import {
  Ref,
  onMounted,
  ref,
  computed,
  ComputedRef,
  reactive,
  toRefs
} from 'vue';
import { useStore } from 'vuex';
import { useIntervalFn } from '@vueuse/core';
import { BigNumber } from 'bignumber.js';
import { Pool } from '@balancer-labs/sor/dist/types';
import { SubgraphPoolBase } from '@balancer-labs/sor2';
import { useI18n } from 'vue-i18n';

import { scale, bnum } from '@/lib/utils';
import { unwrap, wrap } from '@/lib/utils/balancer/wrapper';
import {
  SorManager,
  SorReturn,
  LiquiditySelection
} from '@/lib/utils/balancer/helpers/sor/sorManager';
import { swapIn, swapOut } from '@/lib/utils/balancer/swapper';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import useFathom from '../useFathom';
import useWeb3 from '@/services/web3/useWeb3';

import { ETHER } from '@/constants/tokenlists';
import { TransactionResponse } from '@ethersproject/providers';
import useEthers from '../useEthers';
import { Token, TokenMap } from '@/types';
import { TradeQuote } from './types';
import useTransactions from '../useTransactions';
import useNumbers from '../useNumbers';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = process.env.VUE_APP_MAX_POOLS || '4';
const SWAP_COST = process.env.VUE_APP_SWAP_COST || '100000';
const MIN_PRICE_IMPACT = 0.0001;
const HIGH_PRICE_IMPACT_THRESHOLD = 0.05;
const state = reactive({
  errors: {
    highPriceImpact: false
  }
});

type Props = {
  exactIn: Ref<boolean>;
  tokenInAddressInput: Ref<string>;
  tokenInAmountInput: Ref<string>;
  tokenOutAddressInput: Ref<string>;
  tokenOutAmountInput: Ref<string>;
  tokens: Ref<TokenMap>;
  isWrap: Ref<boolean>;
  isUnwrap: Ref<boolean>;
  tokenInAmountScaled?: ComputedRef<BigNumber>;
  tokenOutAmountScaled?: ComputedRef<BigNumber>;
  sorConfig?: {
    refetchPools: boolean;
    handleAmountsOnFetchPools: boolean;
    enableTxHandler: boolean;
  };
  tokenIn?: ComputedRef<Token>;
  tokenOut?: ComputedRef<Token>;
  slippageBufferRate: ComputedRef<number>;
};

export type UseSor = ReturnType<typeof useSor>;

export default function useSor({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokens,
  isWrap,
  isUnwrap,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  sorConfig = {
    refetchPools: true,
    handleAmountsOnFetchPools: true,
    enableTxHandler: true
  },
  tokenIn,
  tokenOut,
  slippageBufferRate
}: Props) {
  let sorManager: SorManager | undefined = undefined;
  const pools = ref<(Pool | SubgraphPoolBase)[]>([]);
  const sorReturn = ref<SorReturn>({
    isV1swap: false,
    isV1best: false,
    hasSwaps: false,
    tokenIn: '',
    tokenOut: '',
    returnDecimals: 18,
    returnAmount: new BigNumber(0),
    marketSpNormalised: new BigNumber(0),
    v1result: [[], new BigNumber(0), new BigNumber(0)],
    v2result: {
      tokenAddresses: [],
      swaps: [],
      swapAmount: new BigNumber(0),
      returnAmount: new BigNumber(0),
      returnAmountConsideringFees: new BigNumber(0),
      tokenIn: '',
      tokenOut: '',
      marketSp: new BigNumber(0)
    }
  });
  const trading = ref(false);
  const priceImpact = ref(0);
  const latestTxHash = ref('');
  const poolsLoading = ref(true);

  // COMPOSABLES
  const store = useStore();
  const {
    getProvider: getWeb3Provider,
    userNetworkConfig,
    isV1Supported
  } = useWeb3();
  const provider = computed(() => getWeb3Provider());
  const { trackGoal, Goals } = useFathom();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { fNum } = useNumbers();
  const { t } = useI18n();

  const liquiditySelection = computed(() => store.state.app.tradeLiquidity);

  onMounted(async () => {
    const unknownAssets: string[] = [];
    if (!tokens.value[tokenInAddressInput.value]) {
      unknownAssets.push(tokenInAddressInput.value);
    }
    if (!tokens.value[tokenOutAddressInput.value]) {
      unknownAssets.push(tokenOutAddressInput.value);
    }
    await store.dispatch('registry/injectTokens', unknownAssets);
    await initSor();
    await handleAmountChange();
  });

  useIntervalFn(async () => {
    if (sorConfig.refetchPools && sorManager) {
      fetchPools();
    }
  }, 30 * 1e3);

  function resetState() {
    state.errors.highPriceImpact = false;
  }

  async function initSor(): Promise<void> {
    const poolsUrlV1 = `${
      configService.network.poolsUrlV1
    }?timestamp=${Date.now()}`;
    const poolsUrlV2 = `${
      configService.network.poolsUrlV2
    }?timestamp=${Date.now()}`;
    const subgraphUrl = configService.network.subgraph;

    // If V1 previously selected on another network then it uses this and returns no liquidity.
    if (!isV1Supported) {
      store.commit('app/setTradeLiquidity', LiquiditySelection.V2);
    }

    sorManager = new SorManager(
      isV1Supported,
      rpcProviderService.jsonProvider,
      new BigNumber(GAS_PRICE),
      Number(MAX_POOLS),
      configService.network.chainId,
      configService.network.addresses.weth,
      poolsUrlV1,
      poolsUrlV2,
      subgraphUrl
    );

    fetchPools();
  }

  async function fetchPools(): Promise<void> {
    if (!sorManager) {
      return;
    }

    console.time('[SOR] fetchPools');
    await sorManager.fetchPools();
    console.timeEnd('[SOR] fetchPools');
    poolsLoading.value = false;
    // Updates any swaps with up to date pools/balances
    if (sorConfig.handleAmountsOnFetchPools) {
      handleAmountChange();
    }
  }

  async function handleAmountChange(): Promise<void> {
    resetState();

    const amount = exactIn.value
      ? tokenInAmountInput.value
      : tokenOutAmountInput.value;
    // Avoid using SOR if querying a zero value or (un)wrapping trade
    const zeroValueTrade = amount === '' || new BigNumber(amount).isZero();
    if (zeroValueTrade) {
      tokenInAmountInput.value = amount;
      tokenOutAmountInput.value = amount;
      priceImpact.value = 0;
      sorReturn.value.hasSwaps = false;
      sorReturn.value.returnAmount = new BigNumber(0);
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

    const tokenInDecimals = tokens.value[tokenInAddressInput.value]?.decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddressInput.value]?.decimals;

    if (exactIn.value) {
      await setSwapCost(
        tokenOutAddressInput.value,
        tokenOutDecimals,
        sorManager
      );

      const tokenInAmountNormalised = new BigNumber(amount); // Normalized value
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

    state.errors.highPriceImpact =
      priceImpact.value >= HIGH_PRICE_IMPACT_THRESHOLD;
  }

  function txHandler(
    tx: TransactionResponse,
    action?: 'wrap' | 'unwrap' | 'trade'
  ): void {
    let summary = '';
    const tokenInAmountFormatted = fNum(tokenInAmountInput.value, 'token');
    const tokenOutAmountFormatted = fNum(tokenOutAmountInput.value, 'token');

    if (action === 'wrap') {
      summary = t('transactionSummary.wrapETH', [tokenInAmountFormatted]);
    } else if (action === 'unwrap') {
      summary = t('transactionSummary.unwrapETH', [tokenInAmountFormatted]);
    } else {
      summary = `${tokenInAmountFormatted} ${tokenIn?.value.symbol} -> ${tokenOutAmountFormatted} ${tokenOut?.value.symbol}`;
    }

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'trade',
      summary,
      details: {
        tokenIn: tokenIn?.value,
        tokenOut: tokenOut?.value,
        tokenInAddress: tokenInAddressInput.value,
        tokenOutAddress: tokenOutAddressInput.value,
        tokenInAmount: tokenInAmountInput.value,
        tokenOutAmount: tokenOutAmountInput.value,
        exactIn: exactIn.value,
        quote: getQuote(),
        priceImpact: priceImpact.value,
        slippageBufferRate: slippageBufferRate.value
      }
    });

    txListener(tx, {
      onTxConfirmed: () => {
        trading.value = false;
        latestTxHash.value = tx.hash;
        trackGoal(Goals.Swapped);
      },
      onTxFailed: () => {
        trading.value = false;
      }
    });
  }

  async function trade(successCallback?: () => void) {
    trackGoal(Goals.ClickSwap);
    trading.value = true;

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;
    const tokenInDecimals = tokens.value[tokenInAddress].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;
    const tokenInAmountNumber = new BigNumber(tokenInAmountInput.value);
    const tokenInAmountScaled = scale(tokenInAmountNumber, tokenInDecimals);

    if (isWrap.value) {
      try {
        const tx = await wrap(
          String(userNetworkConfig.value.chainId),
          provider.value as any,
          tokenInAmountScaled
        );
        console.log('Wrap tx', tx);
        if (successCallback != null) {
          successCallback();
        }
        txHandler(tx, 'wrap');
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
      return;
    } else if (isUnwrap.value) {
      try {
        const tx = await unwrap(
          String(userNetworkConfig.value.chainId),
          provider.value as any,
          tokenInAmountScaled
        );
        console.log('Unwrap tx', tx);
        if (successCallback != null) {
          successCallback();
        }
        txHandler(tx, 'unwrap');
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
      return;
    }

    if (exactIn.value) {
      const tokenOutAmountNumber = new BigNumber(tokenOutAmountInput.value);
      const tokenOutAmount = scale(tokenOutAmountNumber, tokenOutDecimals);
      const minAmount = getMinOut(tokenOutAmount);
      const sr: SorReturn = sorReturn.value as SorReturn;

      try {
        const tx = await swapIn(
          String(userNetworkConfig.value.chainId),
          provider.value as any,
          sr,
          tokenInAmountScaled,
          minAmount
        );
        console.log('Swap in tx', tx);
        if (successCallback != null) {
          successCallback();
        }
        txHandler(tx, 'trade');
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    } else {
      const tokenInAmountMax = getMaxIn(tokenInAmountScaled);
      const sr: SorReturn = sorReturn.value as SorReturn;
      const tokenOutAmountNormalised = new BigNumber(tokenOutAmountInput.value);
      const tokenOutAmountScaled = scale(
        tokenOutAmountNormalised,
        tokenOutDecimals
      );

      try {
        const tx = await swapOut(
          String(userNetworkConfig.value.chainId),
          provider.value as any,
          sr,
          tokenInAmountMax,
          tokenOutAmountScaled
        );
        console.log('Swap out tx', tx);
        if (successCallback != null) {
          successCallback();
        }
        txHandler(tx);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }
  }

  // Uses stored market prices to calculate swap cost in token denomination
  function calculateSwapCost(tokenAddress: string): BigNumber {
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
    const chainId = userNetworkConfig.value.chainId;
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

  function getMaxIn(amount: BigNumber) {
    return amount
      .times(1 + slippageBufferRate.value)
      .integerValue(BigNumber.ROUND_DOWN);
  }

  function getMinOut(amount: BigNumber) {
    return amount
      .div(1 + slippageBufferRate.value)
      .integerValue(BigNumber.ROUND_DOWN);
  }

  function getQuote(): TradeQuote {
    const maximumInAmount =
      tokenInAmountScaled != null
        ? getMaxIn(tokenInAmountScaled.value).toString()
        : '';

    const minimumOutAmount =
      tokenOutAmountScaled != null
        ? getMinOut(tokenOutAmountScaled.value).toString()
        : '';

    return {
      feeAmountInToken: '0',
      feeAmountOutToken: '0',
      maximumInAmount,
      minimumOutAmount
    };
  }

  return {
    ...toRefs(state),
    sorManager,
    sorReturn,
    pools,
    initSor,
    handleAmountChange,
    exactIn,
    trade,
    trading,
    priceImpact,
    latestTxHash,
    fetchPools,
    poolsLoading,
    getQuote
  };
}
