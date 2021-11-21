import useWeb3 from '@/services/web3/useWeb3';
import { governanceContractsService } from '@/beethovenx/services/governance/governance-contracts.service';
import { erc20ContractService } from '@/beethovenx/services/erc20/erc20-contracts.service';
import useFreshBeetsQuery from '@/beethovenx/composables/stake/useFreshBeetsQuery';
import { computed } from 'vue';
import useTransactions from '@/composables/useTransactions';
import useFarmUser from '@/beethovenx/composables/farms/useFarmUser';
import useAverageBlockTime from '@/beethovenx/composables/blocks/useAverageBlockTime';
import usePools from '@/composables/pools/usePools';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';
import useTokens from '@/composables/useTokens';
import { DecoratedFarm } from '@/beethovenx/services/subgraph/subgraph-types';
import {
  calculateApr,
  calculateRewardsPerDay,
  calculateTvl
} from '@/beethovenx/utils/farmHelper';
import BigNumber from 'bignumber.js';

function bn(num: number) {
  return new BigNumber(num);
}

export function useFreshBeets() {
  const { getProvider, appNetworkConfig } = useWeb3();
  const freshBeetsQuery = useFreshBeetsQuery();
  const { addTransaction } = useTransactions();
  const { farmUser } = useFarmUser(appNetworkConfig.fBeets.farmId);
  const { blocksPerYear, blocksPerDay } = useAverageBlockTime();
  const { pools, farms } = usePools();
  const protocolDataQuery = useProtocolDataQuery();
  const { priceFor, dynamicDataLoaded } = useTokens();
  const { isLoading, isIdle, data } = freshBeetsQuery;

  const fBeetsLoading = computed(() => isLoading.value || isIdle.value);

  const totalSupply = computed(() => data.value?.totalFbeetsSupply ?? bn(0));
  const totalBptStaked = computed(() => {
    return data.value?.totalBptStaked.div(1e18) ?? bn(0);
  });
  const userFbeetsBalance = computed(() => data.value?.userBalance ?? bn(0));
  const userBptTokenBalance = computed(
    () => data.value?.userBptTokenBalance ?? bn(0)
  );
  const userAllowance = computed(() => data.value?.allowance ?? bn(0));
  const currentExchangeRate = computed(() =>
    totalSupply.value.eq(0)
      ? bn(0)
      : totalBptStaked.value.div(totalSupply.value)
  );

  const totalSupplyIsZero = computed(() => totalSupply.value.eq(bn(0)) ?? true);

  /*const exchangeRate = computed(() =>
    !data.value || totalSupplyIsZero.value
      ? '0'
      : userBptTokenBalance.value.div(totalSupply.value).toString()
  );*/

  /*const userExchangeAmount = computed(() =>
    !data.value || totalSupplyIsZero.value
      ? '0'
      : utils.formatUnits(
          userFbeetsBalance.value
            .mul(userBptTokenBalance.value)
            .div(totalSupply.value)
        )
  );*/

  const beetsPrice = computed(
    () => protocolDataQuery.data?.value?.beetsPrice || 0
  );
  const rewardTokenPrice = computed(() =>
    dynamicDataLoaded.value ? priceFor(appNetworkConfig.addresses.hnd) : 0
  );

  const pool = computed(() => {
    console.log(
      pools.value?.find(
        pool =>
          pool.address.toLowerCase() ===
          appNetworkConfig.fBeets.poolAddress.toLowerCase()
      )
    );

    return pools.value?.find(
      pool =>
        pool.address.toLowerCase() ===
        appNetworkConfig.fBeets.poolAddress.toLowerCase()
    );
  });

  const beetsStaked = computed(() => {
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

  const fbeetsDecoratedFarm = computed((): DecoratedFarm | undefined => {
    if (!farm.value || !pool.value) {
      return undefined;
    }

    const tvl = calculateTvl(farm.value, pool.value);
    const apr = calculateApr(
      farm.value,
      tvl,
      blocksPerYear.value,
      beetsPrice.value,
      rewardTokenPrice.value
    );
    const userShare = new BigNumber(farmUser.value?.amount || 0)
      .div(farm.value.slpBalance)
      .toNumber();

    return {
      ...farm.value,
      tvl,
      rewards: calculateRewardsPerDay(farm.value, blocksPerDay.value),
      apr,
      stake: tvl * userShare,
      pendingBeets: farmUser.value?.pendingBeets || 0,
      pendingBeetsValue: (farmUser.value?.pendingBeets || 0) * beetsPrice.value,
      share: userShare,
      pendingRewardToken: farmUser.value?.pendingRewardToken || 0,
      pendingRewardTokenValue: farmUser.value?.pendingRewardTokenValue || 0,
      userBpt: new BigNumber(farmUser.value?.amount || 0).div(1e18).toNumber()
    };
  });

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
    beetsStaked,

    approve,
    stake,
    unStake
  };
}
