import { getAddress } from '@ethersproject/address';
import { TransactionResponse } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { flatten, sumBy } from 'lodash';
import { computed, reactive, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useEthers from '@/composables/useEthers';
import useTransactions from '@/composables/useTransactions';
import { POOLS } from '@/constants/pools';
import {
  bnum,
  includesAddress,
  isSameAddress,
  lsRemove,
  lsSet,
  scale,
} from '@/lib/utils';
import { balancerService } from '@/services/balancer/balancer.service';
import { configService } from '@/services/config/config.service';
import { PoolType } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useTokens from '../useTokens';

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
  name: '',
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
  needsSeeding: false,
  createPoolTxHash: '',
};

export const poolCreationState = reactive({ ...emptyPoolCreationState });
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
    injectedTokens,
    dynamicDataLoading,
  } = useTokens();
  const { account, getProvider } = useWeb3();
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { t } = useI18n();

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

  function getOptimisedLiquidity(): Record<string, OptimisedLiquidity> {
    // need to filter out the empty tokens just in case
    const validTokens = tokensList.value.filter(t => t !== '');
    const optimisedLiquidity = {};
    if (dynamicDataLoading.value) return optimisedLiquidity;
    // token with the lowest balance is the bottleneck
    let bottleneckToken = validTokens[0];
    // keeping track of the lowest amt
    let currentMin = bnum(balanceFor(validTokens[0])).times(
      priceFor(validTokens[0])
    );

    // find the bottleneck token
    for (const token of validTokens) {
      const value = bnum(balanceFor(token)).times(priceFor(token));
      if (value.lt(currentMin)) {
        currentMin = value;
        bottleneckToken = token;
      }
    }
    let bottleneckWeight =
      poolCreationState.seedTokens.find(t =>
        isSameAddress(t.tokenAddress, bottleneckToken)
      )?.weight || 0;
    let bottleneckPrice = priceFor(bottleneckToken || '0');

    // make sure that once we recognise that we are
    // using the nativeAsset for optimisation of liquidity
    // that we use the appropriate weights and balances
    // since we do not want to change the original seedTokens array
    // as the wrapped native asset there is what will
    // be sent to the contract for creation
    if (
      poolCreationState.useNativeAsset &&
      bottleneckToken === wrappedNativeAsset.value.address
    ) {
      bottleneckToken = nativeAsset.address;
      bottleneckWeight =
        poolCreationState.seedTokens.find(t =>
          isSameAddress(t.tokenAddress, wrappedNativeAsset.value.address)
        )?.weight || 0;
      bottleneckPrice = priceFor(wrappedNativeAsset.value.address);
    }
    if (!bottleneckToken) return optimisedLiquidity;

    const bip = bnum(bottleneckPrice)
      .times(balanceFor(bottleneckToken))
      .div(bottleneckWeight);

    return getTokensScaledByBIP(bip);
  }

  const scaledLiquidity = computed((): Record<string, OptimisedLiquidity> => {
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
  });

  const maxInitialLiquidity = computed(() => {
    return sumBy(Object.values(getOptimisedLiquidity()), (liq: any) =>
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
          const relevantToken = poolCreationState.seedTokens.find(t =>
            isSameAddress(t.tokenAddress, token.address)
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
    return includesAddress(
      tokensList.value,
      configService.network.addresses.weth
    );
  });

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
  const { data: similarPoolsResponse, isLoading: isLoadingSimilarPools } =
    usePoolsQuery(tokensList, {}, { isExactTokensList: true });

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
      return tokenA.tokenAddress.toLowerCase() >
        tokenB.tokenAddress.toLowerCase()
        ? 1
        : -1;
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
    return poolCreationState.seedTokens.find((token: PoolSeedToken) =>
      isSameAddress(token.tokenAddress, address)
    );
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

  function setTokensList(newList: string[]) {
    poolCreationState.tokensList = newList;
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
        balanceRequired: balanceRequired.toString(),
      };
    }
    return optimisedLiquidity;
  }

  function getScaledAmounts() {
    const scaledAmounts: string[] = poolCreationState.seedTokens.map(
      (token: PoolSeedToken) => {
        const tokenInfo = getToken(token.tokenAddress);
        if (!tokenInfo) return '0';
        const amount = new BigNumber(token.amount);
        const scaledAmount = scale(amount, tokenInfo.decimals);
        const scaledRoundedAmount = scaledAmount.dp(0, BigNumber.ROUND_FLOOR);
        return scaledRoundedAmount.toString();
      }
    );
    return scaledAmounts;
  }

  function getPoolSymbol() {
    let valid = true;

    const tokenSymbols = poolCreationState.seedTokens.map(
      (token: PoolSeedToken) => {
        const weightRounded = Math.round(token.weight);
        const tokenInfo = getToken(token.tokenAddress);
        if (!tokenInfo) {
          valid = false;
        }
        return tokenInfo
          ? `${Math.round(weightRounded)}${tokenInfo.symbol}`
          : '';
      }
    );

    return valid ? tokenSymbols.join('-') : '';
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
      poolCreationState.createPoolTxHash = tx.hash;
      saveState();

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'createPool',
        summary: t('transactionSummary.createPool'),
        details: {
          name: poolCreationState.name,
        },
      });
      1;
      txListener(tx, {
        onTxConfirmed: async () => {
          retrievePoolAddress(tx.hash);
        },
        onTxFailed: () => {
          console.log('Create failed');
        },
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
            isSameAddress(
              token.tokenAddress,
              wrappedNativeAsset.value.address
            ) &&
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
        summary: t('transactionSummary.fundPool'),
      });

      txListener(tx, {
        onTxConfirmed: async () => {
          resetState();
        },
        onTxFailed: () => {
          console.log('Seed failed');
        },
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

  async function retrievePoolAddress(hash: string) {
    const response =
      await balancerService.pools.weighted.retrievePoolIdAndAddress(
        getProvider(),
        hash
      );
    if (response !== null) {
      poolCreationState.poolId = response.id;
      poolCreationState.poolAddress = response.address;
      poolCreationState.needsSeeding = true;
      saveState();
    }
  }

  // when restoring from a pool creation transaction (not from localstorage)
  async function retrievePoolDetails(hash: string) {
    const details = await balancerService.pools.weighted.retrievePoolDetails(
      getProvider(),
      hash
    );
    if (!details) return;
    poolCreationState.seedTokens = details.tokens.map((token, i) => {
      return {
        tokenAddress: getAddress(token),
        weight: Number(details.weights[i]) * 100,
        isLocked: true,
        amount: '0',
        id: i.toString(),
      };
    });
    poolCreationState.tokensList = details.tokens;
    poolCreationState.createPoolTxHash = hash;
    poolCreationState.activeStep = 3;
    hasRestoredFromSavedState.value = true;

    await retrievePoolAddress(hash);
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
    setTokensList,
    retrievePoolAddress,
    retrievePoolDetails,
    getOptimisedLiquidity,
    currentLiquidity,
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
    hasRestoredFromSavedState,
  };
}
