import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { ref, reactive, toRefs, watch, computed } from 'vue';
import { useQuery } from 'vue-query';

export type TokenWeight = {
  tokenAddress: string;
  weight: number;
  isLocked: boolean;
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

  const setFeeController = (controller: FeeController) => {
    poolCreationState.feeController = controller;
  };

  const setTrpController = (address: string) => {
    poolCreationState.thirdPartyFeeController = address;
  };

  const { data: similarPools, isLoading: isLoadingSimilarPools } = useQuery(
    ['dingo', { a: poolCreationState.tokensList }],
    () => getSimilarPools(poolCreationState.tokensList),
    reactive({
      enabled: poolCreationState.tokensList.length > 0
    })
  );

  const existingPool = computed(() => {
    if (!similarPools.value?.length) return null;
    const similarPool = similarPools.value.find(
      pool => pool.swapFee === poolCreationState.initialFee
    );
    return similarPool;
  });

  return {
    ...toRefs(poolCreationState),
    updateTokenWeights,
    proceed,
    setFeeManagement,
    setFeeType,
    setFeeController,
    setTrpController,
    similarPools,
    isLoadingSimilarPools,
    existingPool
  };
}
