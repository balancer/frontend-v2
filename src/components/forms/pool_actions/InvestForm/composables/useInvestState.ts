import { reactive, toRefs } from 'vue';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { SOR } from '@balancer-labs/sor2';

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
  sorReady: false
});

const sor = new SOR(
  rpcProviderService.jsonProvider as any,
  configService.network.chainId,
  configService.network.subgraph
);

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
    resetAmounts
  };
}
