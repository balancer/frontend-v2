import { reactive, toRefs } from 'vue';

type InvestState = {
  amounts: string[];
  tokenAddresses: string[];
  propAmounts: string[];
  validInputs: boolean[];
  highPriceImpactAccepted: boolean;
  submitting: boolean;
};

/**
 * STATE
 */
const state = reactive<InvestState>({
  amounts: [],
  tokenAddresses: [],
  propAmounts: [],
  validInputs: [],
  highPriceImpactAccepted: false,
  submitting: false
});

/**
 * METHODS
 */
function resetAmounts(): void {
  state.amounts = [];
}

export default function useInvestState() {
  return {
    ...toRefs(state),
    resetAmounts
  };
}
