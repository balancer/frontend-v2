import { SOR } from '@balancer-labs/sor';
import { computed, onMounted, ref } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { Swap, Pool } from '@balancer-labs/sor/dist/types';
import { BigNumber } from 'bignumber.js';
import { scale } from '@/utils';
import getProvider from '@/utils/provider';
import { useStore } from 'vuex';
import useAuth from '@/composables/useAuth';
import { swapIn, swapOut } from '@/utils/balancer/trade';
import useBlocknative from '@/composables/useBlocknative';
import { ETHER } from '@/constants/tokenlists';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = 4;

export default function useSor(
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokens
) {
  let sor: SOR | undefined = undefined;
  const pools = ref<Pool[]>([]);
  const swaps = ref<Swap[][]>([]);
  const trading = ref(false);
  const exactIn = ref(true);
  const slippage = ref(0);

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const notify = useBlocknative();

  const { getConfig } = store.getters;

  onMounted(async () => await initSor());

  useIntervalFn(async () => {
    if (sor) {
      console.time('[SOR] fetchPools');
      await sor.fetchPools();
      console.timeEnd('[SOR] fetchPools');
    }
  }, 30 * 1e3);

  async function initSor(): Promise<void> {
    const config = getConfig();
    const poolsUrl = `${config.subgraphBackupUrl}?timestamp=${Date.now()}`;
    sor = new SOR(
      getProvider(config.chainId),
      new BigNumber(GAS_PRICE),
      MAX_POOLS,
      config.chainId,
      poolsUrl
    );
    console.time('[SOR] fetchPools');
    await sor.fetchPools();
    console.timeEnd('[SOR] fetchPools');
    pools.value = sor.onChainCache.pools;
  }

  async function handleAmountChange(
    isExactIn: boolean,
    amount: string
  ): Promise<void> {
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
      !sor ||
      !sor.hasDataForPair(tokenInAddress, tokenOutAddress)
    ) {
      return;
    }

    exactIn.value = isExactIn;
    const tokenInDecimals = tokens.value[tokenInAddressInput.value].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddressInput.value].decimals;
    const tokenAmountRaw = new BigNumber(amount);

    if (isExactIn) {
      const tokenInAmount = scale(tokenAmountRaw, tokenInDecimals);

      console.time(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
      );
      const [tradeSwaps, tradeAmount, spotPrice] = await sor.getSwaps(
        tokenInAddress,
        tokenOutAddress,
        'swapExactIn',
        tokenInAmount
      );
      console.timeEnd(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
      );

      swaps.value = tradeSwaps;

      const tokenOutAmountRaw = scale(tradeAmount, -tokenOutDecimals);
      tokenOutAmountInput.value = tokenOutAmountRaw.toFixed(
        6,
        BigNumber.ROUND_DOWN
      );

      if (tradeSwaps.length === 0) {
        slippage.value = 0;
      } else {
        const price = tokenInAmount.div(tradeAmount).times('1e18');
        const slippageNumber = price.div(spotPrice).minus(1);
        slippage.value = slippageNumber.isNegative()
          ? 0.00001
          : slippageNumber.toNumber();
      }
    } else {
      const tokenOutAmount = scale(tokenAmountRaw, tokenOutDecimals);

      console.time(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactOut`
      );

      const [tradeSwaps, tradeAmount, spotPrice] = await sor.getSwaps(
        tokenInAddress,
        tokenOutAddress,
        'swapExactOut',
        tokenOutAmount
      );
      console.timeEnd(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactOut`
      );
      swaps.value = tradeSwaps;

      const tokenInAmountRaw = scale(tradeAmount, -tokenInDecimals);
      tokenInAmountInput.value = tokenInAmountRaw.toFixed(
        6,
        BigNumber.ROUND_DOWN
      );

      if (tradeSwaps.length === 0) {
        slippage.value = 0;
      } else {
        const price = tradeAmount.div(tokenOutAmount).times('1e18');
        const slippageNumber = price.div(spotPrice).minus(1);
        slippage.value = slippageNumber.isNegative()
          ? 0.00001
          : slippageNumber.toNumber();
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
    const tokenInAmount = scale(tokenInAmountNumber, tokenInDecimals);
    const slippageBufferRate = parseFloat(store.state.app.slippage);

    if (exactIn.value) {
      const tokenOutAmountNumber = new BigNumber(tokenOutAmountInput.value);
      const tokenOutAmount = scale(tokenOutAmountNumber, tokenOutDecimals);
      const minAmount = tokenOutAmount
        .div(1 + slippageBufferRate)
        .integerValue(BigNumber.ROUND_DOWN);

      try {
        const tx = await swapIn(
          chainId,
          auth.web3,
          swaps.value,
          tokenInAddress,
          tokenOutAddress,
          tokenInAmount,
          minAmount
        );
        txListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    } else {
      const tokenInAmountMax = tokenInAmount
        .times(1 + slippageBufferRate)
        .integerValue(BigNumber.ROUND_DOWN);

      try {
        const tx = await swapOut(
          chainId,
          auth.web3,
          swaps.value,
          tokenInAddress,
          tokenOutAddress,
          tokenInAmountMax
        );
        txListener(tx.hash);
      } catch (e) {
        console.log(e);
        trading.value = false;
      }
    }
  }

  return {
    sor,
    pools,
    initSor,
    handleAmountChange,
    trade,
    trading,
    slippage
  };
}
