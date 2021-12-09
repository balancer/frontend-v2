import { ref, reactive, toRefs, watch, computed } from 'vue';

import { useI18n } from 'vue-i18n';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import useTokens from '../useTokens';
import useWeb3 from '@/services/web3/useWeb3';

import BigNumber from 'bignumber.js';
import { flatten, sumBy } from 'lodash';
import { bnum, lsRemove, lsSet, scale } from '@/lib/utils';

import { PoolType } from '@/services/balancer/subgraph/types';
import { balancerService } from '@/services/balancer/balancer.service';
import { configService } from '@/services/config/config.service';
import { TransactionResponse } from '@ethersproject/providers';
import { POOLS } from '@/constants/pools';

export const POOL_CREATION_STATE_VERSION = '1.0';
export const POOL_CREATION_STATE_KEY = 'poolCreationState';

export type PoolSeedToken = {
  tokenAddress: string;
  weight: number;
  isLocked: boolean;
  amount: string;
  id: string;
};

export type OptimisedLiquidity = {
  liquidityRequired: string;
  balanceRequired: string;
};

type FeeManagementType = 'governance' | 'self';
type FeeType = 'fixed' | 'dynamic';
type FeeController = 'self' | 'other';

const emptyPoolCreationState = {
  name: 'MyPool',
  seedTokens: [] as PoolSeedToken[],
  activeStep: 0,
  initialFee: '0.003',
  isFeeGovManaged: false,
  feeManagementType: 'governance' as FeeManagementType,
  feeType: 'fixed' as FeeType,
  feeController: 'self' as FeeController,
  thirdPartyFeeController: '',
  fee: '',
  tokensList: [] as string[],
  poolId: '' as string,
  poolAddress: '',
  symbol: '',
  manuallySetToken: '' as string,
  autoOptimiseBalances: false,
  useNativeAsset: false,
  type: PoolType.Weighted,
  acceptedCustomTokenDisclaimer: false,
  needsSeeding: false
};

const poolCreationState = reactive({ ...emptyPoolCreationState });
const tokenColors = ref<string[]>([]);
export const hasRestoredFromSavedState = ref<boolean | null>(null);

export default function usePoolCreation() {
  /**
   * COMPOSABLES
   */
  const {
    balanceFor,
    priceFor,
    getToken,
    nativeAsset,
    wrappedNativeAsset,
    injectedTokens
  } = useTokens();
  const { account, getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

  /**
   * WATCHERS
   */
  watch(
    () => poolCreationState.seedTokens,
    () => {
      poolCreationState.tokensList = poolCreationState.seedTokens.map(
        w => w.tokenAddress
      );

      poolCreationState.name = getPoolSymbol();
      poolCreationState.symbol = getPoolSymbol();
    },
    {
      deep: true
    }
  );

  /**
   * COMPUTED
   */
  const tokensList = computed(() =>
    [...poolCreationState.tokensList].sort((tokenA, tokenB) => {
      return tokenA > tokenB ? 1 : -1;
    })
  );

  const hasInjectedToken = computed(() => {
    return tokensList.value.some(
      token => injectedTokens.value[token]?.symbol !== undefined
    );
  });

  const optimisedLiquidity = computed(
    (): Record<string, OptimisedLiquidity> => {
      // need to filter out the empty tokens just in case
      const validTokens = tokensList.value.filter(t => t !== '');
      const optimisedLiquidity = {};

      // token with the lowest balance is the bottleneck
      let bottleneckToken = validTokens[0];
      // keeping track of the lowest amt
      let currentMin = bnum(balanceFor(validTokens[0])).times(
        priceFor(validTokens[0])
      );
      for (const token of validTokens) {
        const value = bnum(balanceFor(token)).times(priceFor(token));
        if (value.lt(currentMin)) {
          currentMin = value;
          bottleneckToken = token;
        }
      }
      if (!bottleneckToken) return optimisedLiquidity;

      const bottleneckWeight =
        poolCreationState.seedTokens.find(
          t => t.tokenAddress === bottleneckToken
        )?.weight || 0;

      const bip = bnum(priceFor(bottleneckToken || '0'))
        .times(balanceFor(bottleneckToken))
        .div(bottleneckWeight);

      return getTokensScaledByBIP(bip);
    }
  );

  const scaledLiquidity = computed(
    (): Record<string, OptimisedLiquidity> => {
      const scaledLiquidity = {};
      const manuallySetToken =
        poolCreationState.manuallySetToken === nativeAsset.address
          ? wrappedNativeAsset.value.address
          : poolCreationState.manuallySetToken;
      const modifiedToken = findSeedTokenByAddress(manuallySetToken);
      if (!modifiedToken) return scaledLiquidity;

      const bip = bnum(priceFor(modifiedToken.tokenAddress || '0'))
        .times(modifiedToken.amount)
        .div(modifiedToken.weight);

      return getTokensScaledByBIP(bip);
    }
  );

  const maxInitialLiquidity = computed(() => {
    return sumBy(Object.values(optimisedLiquidity.value), (liq: any) =>
      Number(liq.liquidityRequired)
    );
  });

  const totalLiquidity = computed(() => {
    let total = bnum(0);
    for (const token of tokensList.value) {
      total = total.plus(bnum(priceFor(token)).times(balanceFor(token)));
    }
    return total;
  });

  const currentLiquidity = computed(() => {
    let total = bnum(0);
    for (const token of poolCreationState.seedTokens) {
      total = total.plus(
        bnum(token.amount).times(priceFor(token.tokenAddress))
      );
    }
    return total;
  });

  const poolLiquidity = computed(() => {
    let sum = bnum(0);
    for (const token of poolCreationState.seedTokens) {
      sum = sum.plus(bnum(token.amount).times(priceFor(token.tokenAddress)));
    }
    return sum;
  });

  const poolTypeString = computed((): string => {
    switch (poolCreationState.type) {
      case PoolType.Weighted:
        return 'weighted';
      default:
        return '';
    }
  });

  const tokensWithNoPrice = computed(() => {
    const validTokens = tokensList.value.filter(t => t !== '');
    return validTokens.filter(token => priceFor(token) === 0);
  });

  const similarPools = computed(() => {
    return flatten(similarPoolsResponse.value?.pages.map(p => p.pools));
  });

  const existingPool = computed(() => {
    if (!similarPools.value?.length) return null;

    const similarPool = similarPools.value.find(pool => {
      if (pool.swapFee === poolCreationState.initialFee) {
        let weightsMatch = true;
        for (const token of pool.tokens) {
          const relevantToken = poolCreationState.seedTokens.find(
            t => t.tokenAddress === token.address
          );
          const similarPoolWeight = Number(token.weight).toFixed(2);
          const seedTokenWeight = ((relevantToken?.weight || 0) / 100).toFixed(
            2
          );
          if (similarPoolWeight !== seedTokenWeight) {
            weightsMatch = false;
          }
        }
        return weightsMatch;
      }
      return false;
    });
    return similarPool;
  });

  const isWethPool = computed((): boolean => {
    return tokensList.value.includes(configService.network.addresses.weth);
  });

  const isSimilarPoolsQueryEnabled = computed(
    () => tokensList.value.length > 0
  );

  const poolOwner = computed(() => {
    if (poolCreationState.feeManagementType === 'governance') {
      return POOLS.DelegateOwner;
    } else {
      if (poolCreationState.feeController === 'self') {
        return account.value;
      } else {
        return poolCreationState.thirdPartyFeeController;
      }
    }
  });

  /**
   * FUNCTIONS
   */
  const {
    data: similarPoolsResponse,
    isLoading: isLoadingSimilarPools
  } = usePoolsQuery(
    tokensList,
    { enabled: isSimilarPoolsQueryEnabled.value },
    { isExactTokensList: true, pageSize: 999 }
  );

  function resetPoolCreationState() {
    for (const key of Object.keys(poolCreationState)) {
      poolCreationState[key] = emptyPoolCreationState[key];
    }
    setRestoredState(false);
    resetState();
  }

  function updateTokenWeights(weights: PoolSeedToken[]) {
    poolCreationState.seedTokens = weights;
  }

  function sortSeedTokens() {
    poolCreationState.seedTokens.sort((tokenA, tokenB) => {
      return tokenA.tokenAddress > tokenB.tokenAddress ? 1 : -1;
    });
  }

  function proceed() {
    if (!similarPools.value.length && poolCreationState.activeStep === 1) {
      poolCreationState.activeStep += 2;
    } else {
      poolCreationState.activeStep += 1;
    }
    saveState();
  }

  function goBack() {
    if (!similarPools.value.length && poolCreationState.activeStep === 3) {
      poolCreationState.activeStep -= 2;
      return;
    }
    poolCreationState.activeStep -= 1;
    if (hasRestoredFromSavedState.value) {
      setRestoredState(false);
    }
  }

  function findSeedTokenByAddress(address: string) {
    return poolCreationState.seedTokens.find((token: PoolSeedToken) => {
      return token.tokenAddress === address;
    });
  }

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

  function updateManuallySetToken(address: string) {
    poolCreationState.manuallySetToken = address;
  }

  function clearAmounts() {
    for (const token of poolCreationState.seedTokens) {
      token.amount = '0';
    }
  }

  function setAmountsToMaxBalances() {
    for (const token of poolCreationState.seedTokens) {
      token.amount = balanceFor(token.tokenAddress);
    }
  }

  function getTokensScaledByBIP(
    bip: BigNumber
  ): Record<string, OptimisedLiquidity> {
    const optimisedLiquidity = {};
    for (const token of poolCreationState.seedTokens) {
      // get the price for a single token
      const tokenPrice = bnum(priceFor(token.tokenAddress));
      // the usd value needed for its weight
      const liquidityRequired: BigNumber = bip.times(token.weight);
      const balanceRequired: BigNumber = liquidityRequired.div(tokenPrice);
      optimisedLiquidity[token.tokenAddress] = {
        liquidityRequired: liquidityRequired.toString(),
        balanceRequired: balanceRequired.toString()
      };
    }
    return optimisedLiquidity;
  }

  function getScaledAmounts() {
    const scaledAmounts: string[] = poolCreationState.seedTokens.map(
      (token: PoolSeedToken) => {
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
    const tokenSymbols = poolCreationState.seedTokens.map(
      (token: PoolSeedToken) => {
        const weightRounded = Math.round(token.weight);
        const tokenInfo = getToken(token.tokenAddress);
        return `${Math.round(weightRounded)}${tokenInfo?.symbol || 'N/A'}`;
      }
    );

    return tokenSymbols.join('-');
  }

  async function createPool(): Promise<TransactionResponse> {
    const provider = getProvider();
    try {
      const tx = await balancerService.pools.weighted.create(
        provider,
        poolCreationState.name,
        poolCreationState.symbol,
        poolCreationState.initialFee,
        poolCreationState.seedTokens,
        poolOwner.value
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
          poolCreationState.needsSeeding = true;
          saveState();
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
    const provider = getProvider();
    try {
      const tokenAddresses: string[] = poolCreationState.seedTokens.map(
        (token: PoolSeedToken) => {
          if (
            token.tokenAddress === wrappedNativeAsset.value.address &&
            poolCreationState.useNativeAsset
          ) {
            return nativeAsset.address;
          }
          return token.tokenAddress;
        }
      );
      const tx = await balancerService.pools.weighted.initJoin(
        provider,
        poolCreationState.poolId,
        account.value,
        account.value,
        tokenAddresses,
        getScaledAmounts()
      );

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'fundPool',
        summary: t('transactionSummary.fundPool')
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          resetState();
        },
        onTxFailed: () => {
          console.log('Seed failed');
        }
      });

      return tx;
    } catch (e) {
      console.log(e);
      return Promise.reject('Join failed');
    }
  }

  function setActiveStep(step: number) {
    poolCreationState.activeStep = step;
  }

  function acceptCustomTokenDisclaimer() {
    poolCreationState.acceptedCustomTokenDisclaimer = true;
  }

  function saveState() {
    lsSet(
      POOL_CREATION_STATE_KEY,
      JSON.stringify(poolCreationState),
      POOL_CREATION_STATE_VERSION
    );
  }

  function resetState() {
    lsRemove(POOL_CREATION_STATE_KEY);
  }

  function importState(state) {
    for (const key of Object.keys(poolCreationState)) {
      if (key === 'activeStep') continue;
      poolCreationState[key] = state[key];
    }
  }

  function setRestoredState(value: boolean) {
    hasRestoredFromSavedState.value = value;
  }

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
    updateTokenColors,
    goBack,
    getPoolSymbol,
    getScaledAmounts,
    createPool,
    joinPool,
    setActiveStep,
    updateManuallySetToken,
    sortSeedTokens,
    clearAmounts,
    setAmountsToMaxBalances,
    acceptCustomTokenDisclaimer,
    saveState,
    resetState,
    importState,
    setRestoredState,
    currentLiquidity,
    optimisedLiquidity,
    scaledLiquidity,
    tokensWithNoPrice,
    similarPools,
    isLoadingSimilarPools,
    existingPool,
    totalLiquidity,
    maxInitialLiquidity,
    poolLiquidity,
    poolTypeString,
    tokenColors,
    isWethPool,
    hasInjectedToken,
    hasRestoredFromSavedState
  };
}
