import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import useTokens from '@/composables/useTokens';
import { masterChefContractsService } from '@/beethovenx/services/farm/master-chef-contracts.service';
import { FarmUser } from '@/beethovenx/services/subgraph/subgraph-types';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

export default function useAllFarmsForUserQuery(
  options: QueryObserverOptions<FarmUser[]> = {}
) {
  const { account, isWalletReady, appNetworkConfig } = useWeb3();
  const { appLoading } = useApp();
  const { priceFor, dynamicDataLoading, loading } = useTokens();
  const protocolDataQuery = useProtocolDataQuery();
  const beetsPrice = computed(
    () => protocolDataQuery.data?.value?.beetsPrice || 0
  );
  const enabled = computed(
    () =>
      isWalletReady.value &&
      account.value != null &&
      !appLoading.value &&
      !loading.value &&
      !dynamicDataLoading.value
  );
  const queryKey = QUERY_KEYS.Farms.UserAllFarms(account);

  const queryFn = async () => {
    try {
      const userFarms = await beethovenxService.getUserDataForAllFarms(
        account.value
      );
      const decoratedUserFarms: FarmUser[] = [];

      for (const userFarm of userFarms) {
        const pendingBeets = await masterChefContractsService.masterChef.getPendingBeetsForFarm(
          userFarm.farmId,
          account.value
        );

        const pendingRewardToken = await masterChefContractsService.hndRewarder.getPendingReward(
          userFarm.farmId,
          account.value
        );

        const hndPrice = priceFor(appNetworkConfig.addresses.hnd);

        decoratedUserFarms.push({
          ...userFarm,
          amount: userFarm.amount,
          rewardDebt: parseFloat(userFarm.rewardDebt),
          beetsHarvested: parseFloat(userFarm.beetsHarvested),
          pendingBeets,
          pendingBeetsValue: pendingBeets * beetsPrice.value,
          pendingRewardToken,
          pendingRewardTokenValue: pendingRewardToken * hndPrice
        });
      }

      return decoratedUserFarms;
    } catch (e) {
      console.log('ERROR', e);
      return [];
    }
  };

  const queryOptions = reactive({
    enabled,
    refetchInterval: 3000,
    ...options
  });

  return useQuery<FarmUser[]>(queryKey, queryFn, queryOptions);
}
