import { reactive, toRefs } from 'vue';

import { balancer } from '@/lib/balancer.sdk';
import { Address } from '@/types';

type InvestState = {
  amounts: string[];
  tokenAddresses: Address[];
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
