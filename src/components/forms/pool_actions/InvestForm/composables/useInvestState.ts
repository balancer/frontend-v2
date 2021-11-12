import { reactive, toRefs } from 'vue';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { queryBatchSwapTokensIn, SOR, SwapV2 } from '@balancer-labs/sor2';
import { Contract } from 'ethers';
import { parseUnits } from '@ethersproject/units';
import VaultAbi from '@/lib/abi/VaultAbi.json';
import useTokens from '@/composables/useTokens';

export type BatchSwapQuery = {
  amountTokenOut: string;
  swaps: SwapV2[];
  assets: string[];
};

type InvestState = {
  amounts: string[];
  tokenAddresses: string[];
  propAmounts: string[];
  validInputs: boolean[];
  highPriceImpactAccepted: boolean;
  submitting: boolean;
  sorReady: boolean;
  batchSwapQuery: BatchSwapQuery | null;
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
  batchSwapQuery: null
});

const sor = new SOR(
  rpcProviderService.jsonProvider,
  configService.network.chainId,
  configService.network.subgraph
);

export const vault = new Contract(
  configService.network.addresses.vault,
  VaultAbi,
  rpcProviderService.jsonProvider
);

/**
 * METHODS
 */
function resetAmounts(): void {
  state.amounts = [];
}

export default function useInvestState() {
  /**
   * COMPOSABLES
   */
  const { tokens } = useTokens();

  async function initBatchSwapQuery(
    poolAddress: string,
    tokensIn: string[]
  ): Promise<void> {
    const amountsIn = tokensIn.map(address =>
      parseUnits('10', tokens.value[address].decimals)
    );
    tokensIn = tokensIn.map(address => address.toLowerCase());

    state.batchSwapQuery = await queryBatchSwapTokensIn(
      sor,
      vault,
      tokensIn,
      amountsIn,
      poolAddress.toLowerCase()
    );
  }

  return {
    ...toRefs(state),
    sor,
    resetAmounts,
    initBatchSwapQuery
  };
}
