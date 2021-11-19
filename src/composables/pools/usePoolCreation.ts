import { PoolType } from '@/services/balancer/subgraph/types';
import { flatten, minBy, sumBy } from 'lodash';
import { ref, reactive, toRefs, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import useTokens from '../useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import { balancerService } from '@/services/balancer/balancer.service';
import { AddressZero } from '@ethersproject/constants';
import { bnum, scale } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { TransactionResponse } from '@ethersproject/providers';

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

const emptyPoolCreationState = {
  name: 'MyPool',
  tokenWeights: [] as TokenWeight[],
  activeStep: 0,
  initialFee: '0.003',
  isFeeGovManaged: false,
  feeManagementType: 'governance' as FeeManagementType,
  feeType: 'fixed' as FeeType,
  feeController: 'self' as FeeController,
  thirdPartyFeeController: '',
  fee: '0',
  tokensList: [] as string[],
  poolId: '' as string,
  poolAddress: '',
  type: PoolType.Weighted
};

const poolCreationState = reactive({ ...emptyPoolCreationState });

const tokenColors = ref<string[]>([]);

export default function usePoolCreation() {
  const { balanceFor, priceFor, getToken } = useTokens();
  const { account, getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();
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

  function resetPoolCreationState() {
    for (const key of Object.keys(poolCreationState)) {
      poolCreationState[key] = emptyPoolCreationState[key];
    }
  }

  const updateTokenWeights = (weights: TokenWeight[]) => {
    poolCreationState.tokenWeights = weights;
  };

  const sortTokenWeights = () => {
    poolCreationState.tokenWeights.sort((tokenA, tokenB) => {
      return tokenA.tokenAddress > tokenB.tokenAddress ? 1 : -1;
    });
  };

  const proceed = () => {
    if (!similarPools.value.length && poolCreationState.activeStep === 1) {
      poolCreationState.activeStep += 2;
    } else {
      poolCreationState.activeStep += 1;
    }
  };

  const goBack = () => {
    poolCreationState.activeStep -= 1;
  };

  function setFeeManagement(type: FeeManagementType) {
    poolCreationState.feeManagementType = type;
  }

  function setFeeType(type: FeeType) {
    poolCreationState.feeType = type;
  }

  function setStep(step: number) {
    poolCreationState.activeStep = step;
  }

  function setFeeController(controller: FeeController) {
    poolCreationState.feeController = controller;
  }

  function setTrpController(address: string) {
    poolCreationState.thirdPartyFeeController = address;
  }

  function updateTokenColors(colors: string[]) {
    tokenColors.value = colors;
  }

  function getScaledAmounts() {
    const scaledAmounts: string[] = poolCreationState.tokenWeights.map(
      (token: TokenWeight) => {
        const tokenInfo = getToken(token.tokenAddress);
        const amount = new BigNumber(token.amount);
        const scaledAmount = scale(amount, tokenInfo.decimals);
        const scaledRoundedAmount = scaledAmount.dp(0, BigNumber.ROUND_FLOOR);
        return scaledRoundedAmount.toString();
      }
    );
    return scaledAmounts;
  }

  function getPoolSymbol() {
    const tokenSymbols = poolCreationState.tokenWeights.map(
      (token: TokenWeight) => {
        const weightRounded = Math.round(token.weight);
        const tokenInfo = getToken(token.tokenAddress);
        return `${Math.round(weightRounded)}${tokenInfo.symbol}`;
      }
    );

    return tokenSymbols.join('-');
  }

  async function createPool(): Promise<TransactionResponse> {
    sortTokenWeights();
    const provider = getProvider();
    try {
      const tx = await balancerService.pools.weighted.create(
        provider,
        poolCreationState.name,
        getPoolSymbol(),
        '0.01',
        poolCreationState.tokenWeights,
        // poolCreationState.thirdPartyFeeController
        AddressZero
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'createPool',
        summary: t('transactionSummary.createPool'),
        details: {
          name: poolCreationState.name
        }
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          const poolDetails = await balancerService.pools.weighted.details(
            provider,
            tx
          );
          poolCreationState.poolId = poolDetails.id;
          poolCreationState.poolAddress = poolDetails.address;
        },
        onTxFailed: () => {
          console.log('Create failed');
        }
      });

      return tx;
    } catch (e) {
      console.log(e);
      return Promise.reject('Create failed');
    }
  }

  async function joinPool() {
    sortTokenWeights();
    const provider = getProvider();
    try {
      const tx = await balancerService.pools.weighted.initJoin(
        provider,
        poolCreationState.poolId,
        account.value,
        account.value,
        poolCreationState.tokenWeights,
        getScaledAmounts()
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'fundPool',
        summary: t('transactionSummary.fundPool')
      });

      return tx;
    } catch (e) {
      console.log(e);
      return Promise.reject('Join failed');
    }
  }

  const tokensList = computed(() => poolCreationState.tokensList);

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

  const optimisedLiquidity = computed(() => {
    // need to filter out the empty tokens just in case
    const validTokens = tokensList.value.filter(t => t !== '');
    const optimisedLiquidity = {};
    // token with the lowest balance is the bottleneck
    const bottleneckToken = minBy(
      validTokens,
      token => Number(balanceFor(token)) * Number(priceFor(token))
    );
    if (!bottleneckToken) return optimisedLiquidity;

    const bottleneckWeight =
      poolCreationState.tokenWeights.find(
        t => t.tokenAddress === bottleneckToken
      )?.weight || 0;

    const bip = bnum(priceFor(bottleneckToken || '0'))
      .times(balanceFor(bottleneckToken))
      .div(bottleneckWeight);
    for (const token of poolCreationState.tokenWeights) {
      // get the price for a single token
      const tokenPrice = bnum(priceFor(token.tokenAddress));
      // the usd value needed for its weight
      const liquidityRequired = bip.times(token.weight);
      const balanceRequired = liquidityRequired.div(tokenPrice);
      optimisedLiquidity[token.tokenAddress] = {
        liquidityRequired: liquidityRequired.toString(),
        balanceRequired: balanceRequired.toString()
      };
    }
    return optimisedLiquidity;
  });

  const maxInitialLiquidity = computed(() => {
    return sumBy(Object.values(optimisedLiquidity.value), (liq: any) =>
      Number(liq.liquidityRequired)
    );
  });

  const totalLiquidity = computed(() => {
    return sumBy(tokensList.value, t => priceFor(t) * Number(balanceFor(t)));
  });

  const poolLiquidity = computed(() => {
    return sumBy(
      poolCreationState.tokenWeights,
      tw => priceFor(tw.tokenAddress) * tw.amount
    );
  });

  const tokensWithNoPrice = computed(() => {
    const validTokens = tokensList.value.filter(t => t !== '');
    return validTokens.filter(token => priceFor(token) === 0);
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
    resetPoolCreationState,
    optimisedLiquidity,
    tokensWithNoPrice,
    similarPools,
    isLoadingSimilarPools,
    existingPool,
    totalLiquidity,
    maxInitialLiquidity,
    poolLiquidity,
    getPoolSymbol,
    poolTypeString: '',
    getScaledAmounts,
    createPool,
    joinPool,
    tokenColors,
    updateTokenColors,
    goBack
  };
}
