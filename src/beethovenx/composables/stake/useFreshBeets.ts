import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import useFreshBeetsQuery from '@/beethovenx/composables/stake/useFreshBeetsQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';
import useFarmUser from '@/beethovenx/composables/farms/useFarmUser';
import usePools from '@/composables/pools/usePools';
import { DecoratedFarm } from '@/beethovenx/services/subgraph/subgraph-types';
import BigNumber from 'bignumber.js';

function bn(num: number | string) {
  return new BigNumber(num);
}

export function useFreshBeets() {
  const { getProvider, appNetworkConfig } = useWeb3();
  const freshBeetsQuery = useFreshBeetsQuery();
  const { addTransaction } = useTransactions();
  const { farmUser, farmUserLoading } = useFarmUser(
    appNetworkConfig.fBeets.farmId
  );
  const {
    poolsWithFarms,
    farms,
    allFarmsForUser,
    isLoadingPools,
    isLoadingFarms
  } = usePools();
  const { isLoading, data, refetch } = freshBeetsQuery;

  const fBeetsLoading = computed(() => {
    return (
      isLoading.value ||
      isLoadingPools.value ||
      isLoadingFarms.value ||
      farmUserLoading.value
    );
  });

  const userFbeetsFarm = computed(() =>
    allFarmsForUser.value?.find(
      userFarm => userFarm.farmId === appNetworkConfig.fBeets.farmId
    )
  );
  const totalSupply = computed(
    () => data.value?.totalFbeetsSupply.div(1e18) ?? bn(0)
  );
  const totalBptStaked = computed(() => {
    return data.value?.totalBptStaked.div(1e18) ?? bn(0);
  });
  const userUnstakedFbeetsBalance = computed(() => {
    return data.value?.userBalance?.div(1e18) ?? bn(0);
  });
  const userFbeetsBalance = computed(() => {
    const userFbeetsInFarm = bn(userFbeetsFarm.value?.amount || '0').div(1e18);

    return userUnstakedFbeetsBalance.value.plus(userFbeetsInFarm);
  });
  const userBptTokenBalance = computed(
    () => data.value?.userBptTokenBalance?.div(1e18) ?? bn(0)
  );
  const userAllowance = computed(
    () => data.value?.allowance.div(1e18) ?? bn(0)
  );
  const currentExchangeRate = computed(() => {
    return totalSupply.value.eq(0)
      ? bn(0)
      : totalBptStaked.value.div(totalSupply.value);
  });

  const pool = computed(() => {
    return poolsWithFarms.value?.find(
      pool =>
        pool.address.toLowerCase() ===
        appNetworkConfig.fBeets.poolAddress.toLowerCase()
    );
  });

  const beets = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.beets.toLowerCase()
    )
  );

  const ftm = computed(() =>
    pool.value?.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.weth.toLowerCase()
    )
  );

  const userStakedBptBalance = computed(() =>
    userFbeetsBalance.value.times(currentExchangeRate.value)
  );

  const userBptShare = computed(() => {
    if (!pool.value) {
      return bn(0);
    }

    return userStakedBptBalance.value.div(pool.value.totalShares);
  });

  const beetsPerShare = computed(() => {
    return beets.value && pool.value
      ? `${parseFloat(beets.value.balance) /
          parseFloat(pool.value.totalShares)}`
      : '0';
  });

  const ftmPerShare = computed(() => {
    return ftm.value && pool.value
      ? `${parseFloat(ftm.value.balance) / parseFloat(pool.value.totalShares)}`
      : '0';
  });

  const userStakedBeetsBalance = computed(() =>
    userBptShare.value.times(beets.value?.balance || '0')
  );
  const userStakedFtmBalance = computed(() =>
    userBptShare.value.times(ftm.value?.balance || '0')
  );

  const totalBeetsStaked = computed(() => {
    if (!pool.value) {
      return '0';
    }

    const beets = pool.value.tokens.find(
      token =>
        token.address.toLowerCase() ===
        appNetworkConfig.addresses.beets.toLowerCase()
    );

    return totalBptStaked.value
      .div(pool.value.totalShares)
      .times(beets?.balance || '0')
      .toString();
  });

  const farm = computed(() => {
    return farms.value.find(farm => farm.id === appNetworkConfig.fBeets.farmId);
  });

  const fbeetsDecoratedFarm = computed(
    (): DecoratedFarm | undefined => pool.value?.decoratedFarm
  );

  async function approve(amount?: string) {
    const tx = await erc20ContractService.erc20.approveToken(
      getProvider(),
      governanceContractsService.fbeets.fbeetsAddress,
      governanceContractsService.fbeets.bptTokenAddress,
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: `Approve LP token`,
      details: {
        contractAddress: governanceContractsService.fbeets.bptTokenAddress,
        spender: governanceContractsService.fbeets.fbeetsAddress
      }
    });

    return tx;
  }

  const swapApr = computed(() =>
    pool.value ? parseFloat(pool.value.apr.swapApr) : 0
  );
  const farmApr = computed(() =>
    fbeetsDecoratedFarm.value ? fbeetsDecoratedFarm.value.apr : 0
  );
  const fbeetsApr = computed(() => data.value?.apr || 0);
  const totalApr = computed(
    () => swapApr.value + farmApr.value + fbeetsApr.value
  );

  async function stake(amount: string) {
    const tx = await governanceContractsService.fbeets.enter(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'deposit',
      summary: 'Stake LP tokens for fBEETS',
      details: {
        contractAddress: governanceContractsService.fbeets.bptTokenAddress,
        spender: governanceContractsService.fbeets.fbeetsAddress
      }
    });

    return tx;
  }

  async function unStake(amount: string) {
    const tx = await governanceContractsService.fbeets.leave(
      getProvider(),
      amount
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'claim',
      summary: 'Burn fBEETS and withdraw LP tokens',
      details: {
        contractAddress: governanceContractsService.fbeets.bptTokenAddress,
        spender: governanceContractsService.fbeets.fbeetsAddress
      }
    });

    return tx;
  }

  return {
    fBeetsLoading,
    totalSupply,
    userFbeetsBalance,
    userBptTokenBalance,
    userAllowance,
    freshBeetsQuery,
    currentExchangeRate,
    fbeetsDecoratedFarm,
    farm,
    pool,
    farmUser,
    totalBptStaked,
    totalBeetsStaked,
    userStakedBptBalance,
    userStakedBeetsBalance,
    userStakedFtmBalance,
    beetsPerShare,
    ftmPerShare,
    userUnstakedFbeetsBalance,
    swapApr,
    farmApr,
    fbeetsApr,
    totalApr,
    refetch,

    approve,
    stake,
    unStake
  };
}
