import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { getAddress } from '@ethersproject/address';
import { BigNumber } from 'bignumber.js';
import { flatten } from 'lodash';
import { ref, reactive, toRefs, watch, computed, toRef } from 'vue';
import { useQuery } from 'vue-query';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useTokens from '../useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import { balancerService } from '@/services/balancer/balancer.service';
import { AddressZero } from '@ethersproject/constants';
import { scale } from '@/lib/utils';
import { PoolType } from '@/services/balancer/subgraph/types';

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
  tokensList: [] as string[],
  poolId: '' as string,
  poolAddress: ''
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
  const { balanceFor, getToken } = useTokens();
  const { account, getProvider } = useWeb3();
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
    poolCreationState.activeStep = 0;
  };

  const setFeeController = (controller: FeeController) => {
    poolCreationState.feeController = controller;
  };

  const setTrpController = (address: string) => {
    poolCreationState.thirdPartyFeeController = address;
  };

  const getScaledAmounts = (): BigNumber[] => {
    const scaledAmounts: BigNumber[] = poolCreationState.tokenWeights.map(
      (token: TokenWeight) => {
        const tokenInfo = getToken(token.tokenAddress);
        const amount = new BigNumber(token.amount);
        const scaledAmount = scale(amount, tokenInfo.decimals);
        return scaledAmount;
      }
    );
    return scaledAmounts;
  };

  const getPoolSymbol = (): string => {
    const tokenSymbols = poolCreationState.tokenWeights.map(
      (token: TokenWeight) => {
        const weightRounded = Math.round(token.weight);
        const tokenInfo = getToken(token.tokenAddress);
        return `${Math.round(weightRounded)}${tokenInfo.symbol}`;
      }
    );

    return tokenSymbols.join('-');
  };

  const createPool = async () => {
    const provider = getProvider();
    const poolDetails = await balancerService.pools.weighted.create(
      provider,
      'MyPool',
      getPoolSymbol(),
      '0.01',
      poolCreationState.tokenWeights,
      // poolCreationState.thirdPartyFeeController
      AddressZero
    );
    poolCreationState.poolId = poolDetails.id;
    poolCreationState.poolAddress = poolDetails.address;
  };

  const joinPool = async () => {
    const provider = getProvider();
    const response = await balancerService.pools.weighted.join(
      provider,
      poolCreationState.poolId,
      account.value,
      account.value,
      poolCreationState.tokenWeights,
      getScaledAmounts()
    );
    console.log("Got join pool response: ", response);
  };

  const tokensList = computed(() => poolCreationState.tokensList);
  const balances = computed(() => {
    const _balances: Record<string, string> = {};
    for (const token of tokensList.value) {
      _balances[token] = balanceFor(getAddress(token));
    }
    return _balances;
  });

  const result = usePoolsQuery(tokensList, {}, { isExactTokensList: true });
  const {
    data: similarPoolsResponse,
    isLoading: isLoadingSimilarPools
  } = usePoolsQuery(tokensList, {}, { isExactTokensList: true });
  const similarPools = computed(() => {
    return flatten(similarPoolsResponse.value?.pages.map(p => p.pools));
  });

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
    setStep,
    similarPools,
    isLoadingSimilarPools,
    existingPool,
    getPoolSymbol,
    createPool,
    joinPool
  };
}
