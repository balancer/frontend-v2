import { SOR } from '@balancer-labs/sor';
import { computed, onMounted, ref } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { Pool } from '@balancer-labs/sor/dist/types';
import { BigNumber } from 'bignumber.js';
import { scale, sleep } from '@/utils';
import getProvider from '@/utils/provider';
import { useStore } from 'vuex';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = 4;

export default function useValidation(
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokens
) {
  let sor: SOR | undefined = undefined;
  const pools = ref<Pool[]>([]);
  const trading = ref(false);

  const store = useStore();
  const { config } = store.state.web3;

  const chainId = computed(() => config.chainId);

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

    const tokenInDecimals = tokens.value[tokenInAddress].decimals;
    const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;

    const tokenAmountRaw = new BigNumber(amount);

    if (isExactIn) {
      const tokenInAmount = scale(tokenAmountRaw, tokenInDecimals);

      console.time(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
      );
      const [, tradeAmount] = await sor.getSwaps(
        tokenInAddress,
        tokenOutAddress,
        'swapExactIn',
        tokenInAmount
      );
      console.timeEnd(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
      );

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

      const [, tradeAmount] = await sor.getSwaps(
        tokenInAddress,
        tokenOutAddress,
        'swapExactOut',
        tokenOutAmount
      );
      console.timeEnd(
        `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactOut`
      );

      const tokenInAmountRaw = scale(tradeAmount, -tokenInDecimals);
      tokenInAmountInput.value = tokenInAmountRaw.toFixed(
        6,
        BigNumber.ROUND_DOWN
      );
    }
  }

  async function trade() {
    trading.value = true;
    await sleep(3e3);
    trading.value = false;
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
