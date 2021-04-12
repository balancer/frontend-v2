import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useIntervalFn } from '@vueuse/core';
import { BigNumber } from 'bignumber.js';
import { scale } from '@/utils';
import getProvider from '@/utils/provider';
import useAuth from '@/composables/useAuth';
import { swapIn, swapOut } from '@/utils/balancer/swapper';
import useBlocknative from '@/composables/useBlocknative';
import { ETHER } from '@/constants/tokenlists';
import { SorManager, SorReturn } from '@/utils/balancer/helpers/sor/sorManager';
import { unwrap, wrap } from '@/utils/balancer/wrapper';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = 4;

export default function useSor(
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokens,
  allowanceState,
  isWrap,
  isUnwrap
) {
  let sorManager: SorManager | undefined = undefined;
  const pools = ref<any[]>([]); // TODO - Check type & make sure correct value is returned by SorManager
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
      tokenIn: '',
      tokenOut: '',
      marketSp: new BigNumber(0)
    }
  });
  const trading = ref(false);
  const exactIn = ref(true);
  const slippage = ref(0);

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const { notify } = useBlocknative();

  const getConfig = () => store.getters['web3/getConfig']();

  onMounted(async () => await initSor());

  useIntervalFn(async () => {
    if (sorManager) {
      console.time('[SOR] fetchPools');
      await sorManager.fetchPools();
      console.timeEnd('[SOR] fetchPools');
    }
  }, 30 * 1e3);

  async function initSor(): Promise<void> {
    const config = getConfig();
    const poolsUrlV1 = `${config.poolsUrlV1}?timestamp=${Date.now()}`;
    const poolsUrlV2 = `${config.poolsUrlV2}?timestamp=${Date.now()}`;

    sorManager = new SorManager(
      getProvider(config.chainId),
      new BigNumber(GAS_PRICE),
      MAX_POOLS,
      config.chainId,
      poolsUrlV1,
      poolsUrlV2
    );

    console.time('[SOR] fetchPools');
    await sorManager.fetchPools();
    console.timeEnd('[SOR] fetchPools');
    pools.value = sorManager.selectedPools.pools;
  }

  async function handleAmountChange(
    isExactIn: boolean,
    amount: string
  ): Promise<void> {
    if (isWrap.value || isUnwrap.value) {
      if (isExactIn) {
        tokenOutAmountInput.value = tokenInAmountInput.value;
      } else {
        tokenInAmountInput.value = tokenOutAmountInput.value;
      }
      return;
    }

    const config = getConfig();
    const tokenInAddress =
      tokenInAddressInput.value === ETHER.address
        ? config.addresses.weth
        : tokenInAddressInput.value;
    const tokenOutAddress =
      tokenOutAddressInput.value === ETHER.address
        ? config.addresses.weth
        : tokenOutAddressInput.value;

    if (
      !tokenInAddress ||
      !tokenOutAddress ||
      !sorManager ||
      !sorManager.hasDataForPair(tokenInAddress, tokenOutAddress)
    ) {
      return;
    }

    exactIn.value = isExactIn;
    const tokenInDecimals = tokens.value[tokenInAddressInput.value].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddressInput.value].decimals;

    if (isExactIn) {
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
        allowanceState.value.isUnlockedV1,
        allowanceState.value.isUnlockedV2
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
        slippage.value = 0;
      } else {
        const returnAmtNormalised = scale(
          swapReturn.returnAmount,
          -tokenOutDecimals
        );
        const effectivePrice = tokenInAmountNormalised.div(returnAmtNormalised);
        const slippageCalc = effectivePrice
          .div(swapReturn.marketSpNormalised)
          .minus(1);

        console.log(`EP: ${effectivePrice.toString()}`);
        console.log(`SP: ${swapReturn.marketSpNormalised.toString()}`);
        console.log(`Slippage: ${slippageCalc.toString()}`);

        slippage.value = slippageCalc.isNegative()
          ? 0.00001
          : slippageCalc.toNumber();
      }
    } else {
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
        allowanceState.value.isUnlockedV1,
        allowanceState.value.isUnlockedV2
      );

      sorReturn.value = swapReturn; // TO DO - is it needed?

      const tradeAmount: BigNumber = swapReturn.returnAmount;
      const tokenInAmountNormalised = scale(tradeAmount, -tokenInDecimals);
      tokenInAmountInput.value =
        tokenInAmountNormalised.toNumber() > 0
          ? tokenInAmountNormalised.toFixed(6, BigNumber.ROUND_UP)
          : '';

      if (!sorReturn.value.hasSwaps) {
        slippage.value = 0;
      } else {
        const effectivePrice = tokenInAmountNormalised.div(
          tokenOutAmountNormalised
        );
        const slippageCalc = effectivePrice
          .div(swapReturn.marketSpNormalised)
          .minus(1);

        console.log(`EP: ${effectivePrice.toString()}`);
        console.log(`SP: ${swapReturn.marketSpNormalised.toString()}`);
        console.log(`Slippage: ${slippageCalc.toString()}`);

        slippage.value = slippageCalc.isNegative()
          ? 0.00001
          : slippageCalc.toNumber();
      }
    }
  }

  function txListener(hash) {
    const { emitter } = notify.hash(hash);

    emitter.on('txConfirmed', () => {
      trading.value = false;
      return undefined;
    });

    emitter.on('txCancel', () => {
      // A new transaction has been submitted with the same nonce, a higher gas price, a value of zero and sent to an external address (not a contract)
      trading.value = false;
      return undefined;
    });

    emitter.on('txFailed', () => {
      // An error has occurred initiating the transaction
      trading.value = false;
      return undefined;
    });
  }

  async function trade() {
    const { chainId } = getConfig();
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
        txListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
      return;
    } else if (isUnwrap.value) {
      try {
        const tx = await unwrap(chainId, auth.web3, tokenInAmountScaled);
        console.log('Unwrap tx', tx);
        txListener(tx.hash);
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
        txListener(tx.hash);
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
        txListener(tx.hash);
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
    trade,
    trading,
    slippage
  };
}
