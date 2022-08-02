import { reactive, toRefs } from 'vue';

import { balancer } from '@/lib/balancer.sdk';

type InvestState = {
  amounts: string[];
  tokenAddresses: string[];
  propAmounts: string[];
  validInputs: boolean[];
  highPriceImpactAccepted: boolean;
  submitting: boolean;
  sorReady: boolean;
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
  submitting: false,
  sorReady: false,
});

const sor = balancer.sor;

/**
 * METHODS
 */
function resetAmounts(): void {
  state.amounts = [];
}

export default function useInvestState() {
  return {
    ...toRefs(state),
    sor,
    resetAmounts,
  };
}
