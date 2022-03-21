import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import useTokens from '@/composables/useTokens';
import { masterChefContractsService } from '@/beethovenx/services/farm/master-chef-contracts.service';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';

import { FarmUser } from '@/beethovenx/services/subgraph/subgraph-types';
import { AddressZero } from '@ethersproject/constants';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

export default function useFarmUserQuery(
  farmId: string,
  options: QueryObserverOptions<FarmUser | null> = {}
) {
  const { account, isWalletReady } = useWeb3();
  const { appLoading } = useApp();
  const protocolDataQuery = useProtocolDataQuery();
  const beetsPrice = computed(
    () => protocolDataQuery.data?.value?.beetsPrice || 0
  );
  const { dynamicDataLoading, loading } = useTokens();

  const enabled = computed(
    () =>
      isWalletReady.value &&
      !appLoading.value &&
      !loading.value &&
      !dynamicDataLoading.value
  );
  const queryKey = QUERY_KEYS.Farms.User(farmId, account);

  const queryFn = async () => {
    const address = account.value || AddressZero;

    try {
      const farms = await beethovenxService.getBeetsFarms();
      const farm = farms.find(farm => farm.id === farmId);

      let pendingRewardToken = 0;
      let rewardTokenPrice = 0;

      const userData = await beethovenxService.getUserDataForFarm(
        farmId,
        address
      );
      const pendingBeets = await masterChefContractsService.masterChef.getPendingBeetsForFarm(
        farmId,
        address
      );

      if (farm && farm.rewarder) {
        const pendingRewards = await masterChefContractsService.rewarders.getPendingRewards(
          [farmId],
          [farm.rewarder.id],
          account.value
        );

        pendingRewardToken = pendingRewards[farmId] || 0;
        rewardTokenPrice = farm.rewarder.tokens[0]?.tokenPrice || 0;
      }

      return {
        ...userData,
        amount: userData.amount,
        rewardDebt: parseFloat(userData.rewardDebt),
        beetsHarvested: parseFloat(userData.beetsHarvested),
        pendingBeets,
        pendingBeetsValue: pendingBeets * beetsPrice.value,
        pendingRewardToken,
        pendingRewardTokenValue: rewardTokenPrice * pendingRewardToken
      };
    } catch (e) {
      console.log('ERROR', e);

      return null;
    }
  };

  const queryOptions = reactive({
    enabled,
    refetchInterval: 3000,
    ...options
  });

  return useQuery<FarmUser | null>(queryKey, queryFn, queryOptions);
}
