import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { parseUnits } from '@ethersproject/units';
import useAuth from '@/composables/useAuth';
import { encodeExitWeightedPool } from '@/utils/balancer/weightedPoolEncoding';
import { encodeExitStablePool } from '@/utils/balancer/stablePoolEncoding';
import { exitPool } from '@/utils/balancer/vault';

export default function useExitPool(pool) {
  const store = useStore();
  const auth = useAuth();
  const amountIn = ref('');
  const receiveAmounts = ref([] as string[]);
  const allTokens = computed(() => store.getters.getTokens());
  const poolDecimals = ref(allTokens.value[pool.address].decimals);

  let dataEncodeFn;
  if (pool.strategy.name === 'weightedPool') {
    dataEncodeFn = encodeExitWeightedPool;
  } else if (pool.strategy.name === 'stablePool') {
    dataEncodeFn = encodeExitStablePool;
  }

  const minAmountsOut = computed(() => {
    const slippageTolerance = store.state.app.slippage;
    return pool.tokens.map((token, i) => {
      const receiveAmount = parseFloat(receiveAmounts.value[i]);
      const poolAmountOut = (receiveAmount * (1 - slippageTolerance)).toFixed(
        allTokens.value[token].decimals
      );
      return parseUnits(
        poolAmountOut,
        allTokens.value[token].decimals
      ).toString();
    });
  });

  const bptAmountIn = computed(() => {
    return parseUnits(amountIn.value, poolDecimals.value);
  });

  const txData = computed(() => {
    return dataEncodeFn({
      kind: 'ExactBPTInForAllTokensOut',
      bptAmountIn: bptAmountIn.value
    });
  });

  const txParams = computed(() => {
    const toInternalBalance = false;
    return [
      pool.id,
      store.state.web3.account,
      pool.tokens,
      minAmountsOut.value,
      toInternalBalance,
      txData.value
    ];
  });

  function _exitPool(_amountIn: string, _receiveAmounts: string[]) {
    amountIn.value = _amountIn;
    receiveAmounts.value = _receiveAmounts;

    try {
      return exitPool(store.state.web3.config.key, auth.web3, txParams.value);
    } catch (error) {
      console.error(error);
    }
  }

  return _exitPool;
}
