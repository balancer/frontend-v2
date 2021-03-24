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

  // COMPOSABLES
  const store = useStore();
  const auth = useAuth();
  const notify = useBlocknative();
  const chainId = computed(() => config.chainId);
  const { config } = store.state.web3;

  onMounted(async () => await initSor());

  useIntervalFn(async () => {
    if (sor) {
      console.time('[SOR] fetchPools');
      await sor.fetchPools();
      console.timeEnd('[SOR] fetchPools');
    }
  }, 60 * 1e3);

  async function initSor(): Promise<void> {
    const poolsUrl = `${config.subgraphBackupUrl}?timestamp=${Date.now()}`;
    sor = new SOR(
      getProvider(chainId.value),
      new BigNumber(GAS_PRICE),
      MAX_POOLS,
      chainId.value,
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
    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;

    if (
      !tokenInAddress ||
      !tokenOutAddress ||
      !sor ||
      !sor.hasDataForPair(tokenInAddress, tokenOutAddress)
    ) {
      return;
    }

    exactIn.value = isExactIn;
    const tokenInDecimals = tokens.value[tokenInAddress].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;
    const tokenAmountRaw = new BigNumber(amount);

    if (isExactIn) {
      const tokenInAmount = scale(tokenAmountRaw, tokenInDecimals);

      console.time(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
      );
      const [tradeSwaps, tradeAmount] = await sor.getSwaps(
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
    } else {
      const tokenOutAmount = scale(tokenAmountRaw, tokenOutDecimals);

      console.time(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactOut`
      );

      const [tradeSwaps, tradeAmount] = await sor.getSwaps(
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
    }
  }

  function txListener(hash) {
    const { emitter } = notify.hash(hash);

    emitter.on('txConfirmed', tx => {
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
    trading.value = true;

    const tokenInAddress = tokenInAddressInput.value;
    const tokenOutAddress = tokenOutAddressInput.value;
    const tokenInDecimals = tokens.value[tokenInAddress].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;
    const tokenInAmountNumber = new BigNumber(tokenInAmountInput.value);
    const tokenInAmount = scale(tokenInAmountNumber, tokenInDecimals);
    const slippageBufferRate = 1; // @TODO change to real slippage;

    if (exactIn.value) {
      const tokenOutAmountNumber = new BigNumber(tokenOutAmountInput.value);
      const tokenOutAmount = scale(tokenOutAmountNumber, tokenOutDecimals);
      const minAmount = tokenOutAmount
        .div(1 + slippageBufferRate)
        .integerValue(BigNumber.ROUND_DOWN);

      try {
        const tx = await swapIn(
          config.key,
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
          config.key,
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
    trading
  };
}
