import { reactive, toRefs } from 'vue';

import { Address } from '@/types';

type InvestState = {
  amounts: string[];
  tokenAddresses: Address[];
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
