import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { FullPool, PoolType } from '@/services/balancer/subgraph/types';
import CalculatorService from '@/services/pool/calculator/calculator.sevice';
import { getAddress } from '@ethersproject/address';
import { flatten, sumBy } from 'lodash';
import { ref, reactive, toRefs, watch, computed, toRef } from 'vue';
import { useQuery } from 'vue-query';
import usePoolsQuery from '../queries/usePoolsQuery';
import useTokens from '../useTokens';

export type TokenWeight = {
  tokenAddress: string;
  weight: number;
  isLocked: boolean;
  amount: number;
  id: number;
};

type FeeManagementType = 'governance' | 'self';
type FeeType = 'fixed' | 'dynamic';
type FeeController = 'self' | 'other';

const poolCreationState = reactive({
  tokenWeights: [] as TokenWeight[],
  activeStep: 0,
  initialFee: '0',
  isFeeGovManaged: false,
  feeManagementType: 'governance' as FeeManagementType,
  feeType: 'fixed' as FeeType,
  feeController: 'self' as FeeController,
  thirdPartyFeeController: '',
  fee: '0',
  tokensList: [] as string[]
  // tokensList: [
  //   '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
  //   '0xdfcea9088c8a88a76ff74892c1457c17dfeef9c1'
  // ] as string[]
});

async function getSimilarPools(tokensInPool: string[]) {
  const queryArgs = {
    first: 3,
    where: {
      tokensList: tokensInPool
    }
  };
  const attrs = {
    tokens: {
      symbol: true
    }
  };
  const response = await balancerSubgraphService.pools.get(queryArgs, attrs);
  return response;
}

export default function usePoolCreation() {
  const { balanceFor, tokens, balances, priceFor } = useTokens();
  watch(
    () => poolCreationState.tokenWeights,
    () => {
      poolCreationState.tokensList = poolCreationState.tokenWeights.map(
        w => w.tokenAddress
      );
    },
    {
      deep: true
    }
  );

  const updateTokenWeights = (weights: TokenWeight[]) => {
    poolCreationState.tokenWeights = weights;
  };

  const proceed = () => {
    poolCreationState.activeStep += 1;
  };

  const setFeeManagement = (type: FeeManagementType) => {
    poolCreationState.feeManagementType = type;
  };

  const setFeeType = (type: FeeType) => {
    poolCreationState.feeType = type;
  };

  const setStep = (step: number) => {
    poolCreationState.activeStep = 0;;
  };

  const setFeeController = (controller: FeeController) => {
    poolCreationState.feeController = controller;
  };

  const setTrpController = (address: string) => {
    poolCreationState.thirdPartyFeeController = address;
  };

  const tokensList = computed(() => poolCreationState.tokensList);

  const { data: similarPoolsResponse, isLoading: isLoadingSimilarPools } = usePoolsQuery(tokensList, {}, { isExactTokensList: true });
  const similarPools = computed(() => {
    return flatten(similarPoolsResponse.value?.pages.map(p => p.pools));
  })

  const existingPool = computed(() => {
    if (!similarPools.value?.length) return null;
    const similarPool = similarPools.value.find(
      pool => pool.swapFee === poolCreationState.initialFee
    );
    return similarPool;
  });

  const placeholderPool = computed<FullPool>(() => {
    return {
      onchain: {
        tokens: {},
        totalSupply: '0',
        decimals: 0,
        swapFee: poolCreationState.fee,
        swapEnabled: true
      },
      dynamic: {
        apr: {
          pool: '',
          thirdParty: '',
          liquidityMining: '',
          liquidityMiningBreakdown: {},
          total: ''
        },
        period: '24h',
        volume: '0',
        fees: '',
        isNewPool: true,
      },
      id: 'placeholder',
      address: 'placeholder',
      poolType: PoolType.Weighted,
      swapFee: poolCreationState.fee,
      owner: poolCreationState.feeController,
      factory: 'placeholder',
      tokens: poolCreationState.tokensList.map(t => tokens[t]),
      tokensList: poolCreationState.tokensList,
      tokenAddresses: poolCreationState.tokensList,
      totalLiquidity: '0',
      totalShares: '0',
      totalSwapFee: '0',
      totalSwapVolume: '0',
      hasLiquidityMiningRewards: false,
      createTime: Date.now()
    }
  });

  const totalLiquidity = computed(() => {
    return sumBy(
      tokensList.value,
      t => priceFor(t) * Number(balanceFor(t))
    );
  })

  return {
    ...toRefs(poolCreationState),
    updateTokenWeights,
    proceed,
    setFeeManagement,
    setFeeType,
    setFeeController,
    setTrpController,
    setStep,
    similarPools,
    isLoadingSimilarPools,
    existingPool,
    placeholderPool,
    totalLiquidity
  };
}
