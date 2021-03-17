import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { parseUnits } from '@ethersproject/units';
import useAuth from '@/composables/useAuth';
import { encodeJoinWeightedPool } from '@/utils/balancer/weightedPoolEncoding';
import { joinPool } from '@/utils/balancer/vault';
import { encodeJoinStablePool } from '@/utils/balancer/stablePoolEncoding';

export default function useJoinPool(pool) {
  const store = useStore();
  const auth = useAuth();
  const amounts = ref([] as string[]);
  const receiveAmount = ref('');
  const allTokens = computed(() => store.getters.getTokens());
  const poolDecimals = ref(allTokens.value[pool.address].decimals);
  const isStablePool = pool.strategy.name === 'stablePool';

  let dataEncodeFn;
  if (isStablePool) {
    dataEncodeFn = encodeJoinStablePool;
  } else {
    dataEncodeFn = encodeJoinWeightedPool;
  }

  const amountsIn = computed(() => {
    return pool.tokens.map((token, i) =>
      parseUnits(amounts.value[i], allTokens.value[token].decimals).toString()
    );
  });

  const calcMinBPT = computed(() => {
    const slippageTolerance = store.state.app.slippage;
    const amount = parseFloat(receiveAmount.value);
    const poolAmountOut = (amount * (1 - slippageTolerance)).toFixed(
      poolDecimals.value
    );
    return parseUnits(poolAmountOut, poolDecimals.value);
  });

  const txData = computed(() => {
    if (pool.totalSupply.toString() === '0') {
      return dataEncodeFn({
        kind: 'Init',
        amountsIn: amountsIn.value
      });
    } else {
      const params = { amountsIn: amountsIn.value };
      if (isStablePool) {
        params['bptAmountOut'] = calcMinBPT.value;
      } else {
        params['minimumBPT'] = calcMinBPT.value;
      }
      return dataEncodeFn(params);
    }
  });

  const txParams = computed(() => {
    const fromInternalBalance = false;
    return [
      pool.id,
      store.state.web3.account,
      pool.tokens,
      amountsIn.value,
      fromInternalBalance,
      txData.value
    ];
  });

  function _joinPool(_amounts: string[], _receiveAmount: string) {
    amounts.value = _amounts;
    receiveAmount.value = _receiveAmount;

    try {
      return joinPool(store.state.web3.config.key, auth.web3, txParams.value);
    } catch (error) {
      console.error(error);
    }
  }

  return _joinPool;
}
