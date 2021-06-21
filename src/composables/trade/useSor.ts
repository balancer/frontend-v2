import { Ref, onMounted, ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useIntervalFn } from '@vueuse/core';
import { BigNumber } from 'bignumber.js';
import { Pool } from '@balancer-labs/sor/dist/types';
import { SubgraphPoolBase } from '@balancer-labs/sor2';

import { scale } from '@/lib/utils';
import { unwrap, wrap } from '@/lib/utils/balancer/wrapper';
import getProvider from '@/lib/utils/provider';
import {
  SorManager,
  SorReturn
} from '@/lib/utils/balancer/helpers/sor/sorManager';
import { swapIn, swapOut } from '@/lib/utils/balancer/swapper';
import ConfigService from '@/services/config/config.service';

import useAuth from '@/composables/useAuth';
import useNotify from '@/composables/useNotify';
import useFathom from '../useFathom';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = 4;
const MIN_PRICE_IMPACT = 0.0001;

export default function useSor(
  tokenInAddressInput: Ref<string>,
  tokenInAmountInput: Ref<string>,
  tokenOutAddressInput: Ref<string>,
  tokenOutAmountInput: Ref<string>,
  tokens: Ref<any>,
  allowanceState: any,
  isWrap: Ref<boolean>,
  isUnwrap: Ref<boolean>
) {
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
  const exactIn = ref(true);
  const priceImpact = ref(0);
  const latestTxHash = ref('');
  const poolsLoading = ref(true);

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const { txListener } = useNotify();
  const { trackGoal, Goals } = useFathom();

  const getConfig = () => store.getters['web3/getConfig']();
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
    if (sorManager) {
      fetchPools();
    }
  }, 30 * 1e3);

  watch(liquiditySelection, () => {
    // When the liquidity type is changed we need to update the trade to use that selection
    handleAmountChange();
  });

  async function initSor(): Promise<void> {
    const config = getConfig();
    const poolsUrlV1 = `${config.poolsUrlV1}?timestamp=${Date.now()}`;
    const poolsUrlV2 = `${config.poolsUrlV2}?timestamp=${Date.now()}`;
    const subgraphUrl = new ConfigService().network.subgraph;

    sorManager = new SorManager(
      getProvider(config.chainId),
      new BigNumber(GAS_PRICE),
      MAX_POOLS,
      config.chainId,
      config.addresses.weth,
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
    handleAmountChange();
  }

  async function handleAmountChange(): Promise<void> {
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
      // Notice that outputToken is tokenOut if swapType == 'swapExactIn' and tokenIn if swapType == 'swapExactOut'
      await sorManager.setCostOutputToken(
        tokenOutAddressInput.value,
        tokenOutDecimals
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
      await sorManager.setCostOutputToken(
        tokenInAddressInput.value,
        tokenInDecimals
      );

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

  function tradeTxListener(hash: string) {
    txListener(hash, {
      onTxConfirmed: () => {
        trading.value = false;
        latestTxHash.value = hash;
        trackGoal(Goals.Swapped);
      },
      onTxCancel: () => {
        trading.value = false;
      },
      onTxFailed: () => {
        trading.value = false;
      }
    });
  }

  async function trade() {
    const { chainId } = getConfig();
    trackGoal(Goals.ClickSwap);
    trading.value = true;

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;
    const tokenInDecimals = tokens.value[tokenInAddress].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;
    const tokenInAmountNumber = new BigNumber(tokenInAmountInput.value);
    const tokenInAmountScaled = scale(tokenInAmountNumber, tokenInDecimals);
    const slippageBufferRate = parseFloat(store.state.app.slippage);

    if (isWrap.value) {
      try {
        const tx = await wrap(chainId, auth.web3, tokenInAmountScaled);
        console.log('Wrap tx', tx);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
      return;
    } else if (isUnwrap.value) {
      try {
        const tx = await unwrap(chainId, auth.web3, tokenInAmountScaled);
        console.log('Unwrap tx', tx);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
      return;
    }

    if (exactIn.value) {
      const tokenOutAmountNumber = new BigNumber(tokenOutAmountInput.value);
      const tokenOutAmount = scale(tokenOutAmountNumber, tokenOutDecimals);
      const minAmount = tokenOutAmount
        .div(1 + slippageBufferRate)
        .integerValue(BigNumber.ROUND_DOWN);
      const sr: SorReturn = sorReturn.value as SorReturn;

      try {
        const tx = await swapIn(
          chainId,
          auth.web3,
          sr,
          tokenInAmountScaled,
          minAmount
        );
        console.log('Swap in tx', tx);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    } else {
      const tokenInAmountMax = tokenInAmountScaled
        .times(1 + slippageBufferRate)
        .integerValue(BigNumber.ROUND_DOWN);
      const sr: SorReturn = sorReturn.value as SorReturn;
      const tokenOutAmountNormalised = new BigNumber(tokenOutAmountInput.value);
      const tokenOutAmountScaled = scale(
        tokenOutAmountNormalised,
        tokenOutDecimals
      );

      try {
        const tx = await swapOut(
          chainId,
          auth.web3,
          sr,
          tokenInAmountMax,
          tokenOutAmountScaled
        );
        console.log('Swap out tx', tx);
        tradeTxListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }
  }

  return {
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
    poolsLoading
  };
}
