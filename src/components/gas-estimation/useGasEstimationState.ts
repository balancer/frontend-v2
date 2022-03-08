import { reactive, toRefs } from 'vue';

type GasEstimationState = {
  selectedGasPriceKey: string;
  selectedGasPrice: number | null;
};

/**
 * STATE
 */
const state = reactive<GasEstimationState>({
  selectedGasPriceKey: 'fastPriceGwei',
  selectedGasPrice: null
});

export default function useGasEstimationState() {
  return {
    ...toRefs(state)
  };
}
