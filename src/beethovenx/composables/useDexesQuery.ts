import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import { BigNumber } from 'bignumber.js';
import {
  LiquiditySelection,
  SorManager
} from '@/lib/utils/balancer/helpers/sor/sorManager';
import { scale, scaleDown, sleep } from '@/lib/utils';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import { dexContractsService } from '@/beethovenx/services/dex/dex-contracts.service';
import { SwapTypes } from '@balancer-labs/sdk';

interface QueryResponse {
  spooky: number[];
  spirit: number[];
  beets: number[];
}

interface DexesQueryInput {
  amountIn: string;
  amountInNumber: number;
  tokenIn: string;
  tokenOut: string;
  tokenInDecimal: number;
  tokenOutDecimal: number;
  spookyPath: string[];
  spiritPath: string[];
}

export default function useDexesQuery(
  sorManager: SorManager,
  inputs: DexesQueryInput[]
) {
  const { appLoading } = useApp();
  const { loading } = useTokens();
  const { isWalletReady } = useWeb3();
  const enabled = computed(() => !appLoading.value && !loading.value);
  const queryKey = reactive(QUERY_KEYS.Dexes.GetAmountsOut);

  const queryFn = async () => {
    await sleep(3000);

    const response = await Promise.all(
      inputs.map(async input => {
        const tokenInAmountNormalised = new BigNumber(
          `${input.amountInNumber}`
        ); // Normalized value
        const tokenInAmountScaled = scale(
          tokenInAmountNormalised,
          input.tokenInDecimal
        );

        return sorManager.getBestSwap(
          input.tokenIn,
          input.tokenOut,
          input.tokenInDecimal,
          input.tokenOutDecimal,
          SwapTypes.SwapExactIn,
          tokenInAmountScaled,
          input.tokenInDecimal,
          LiquiditySelection.V2
        );
      })
    );

    const result = {
      spooky: (
        await dexContractsService.spookySwap.getAmountsOut(
          inputs.map(input => ({ ...input, path: input.spookyPath }))
        )
      ).map((value, idx) =>
        scaleDown(
          new BigNumber(value.toString()),
          inputs[idx].tokenOutDecimal
        ).toNumber()
      ),
      spirit: (
        await dexContractsService.spiritSwap.getAmountsOut(
          inputs.map(input => ({ ...input, path: input.spiritPath }))
        )
      ).map((value, idx) =>
        scaleDown(
          new BigNumber(value.toString()),
          inputs[idx].tokenOutDecimal
        ).toNumber()
      ),
      beets: response.map((value, idx) => {
        return scaleDown(
          new BigNumber(value.returnAmount.toString()),
          inputs[idx].tokenOutDecimal
        ).toNumber();
      })
    };

    return result;
  };

  const queryOptions = reactive({
    enabled
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
