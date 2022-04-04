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
import { uniq } from 'lodash';
import useNetwork from '@/composables/useNetwork';
import useConfig from '@/composables/useConfig';

export default function useAllFarmsForUserQuery(
  options: QueryObserverOptions<FarmUser[]> = {}
) {
  const { account, isWalletReady } = useWeb3();
  const { networkConfig } = useConfig();
  const { appLoading } = useApp();
  const { dynamicDataLoading, loading } = useTokens();
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
      if (!account.value) {
        return [];
      }

      const farms = await beethovenxService.getBeetsFarms();
      const userFarms = await beethovenxService.getUserDataForAllFarms(
        account.value
      );
      const decoratedUserFarms: FarmUser[] = [];

      const farmIds = userFarms.map(farm => farm.farmId);
      const rewarders = uniq(
        farms
          .filter(farm => !!farm.rewarder)
          .map(farm => farm.rewarder?.id || '')
      );
      const pendingBeetsForFarms = await masterChefContractsService.masterChef.getPendingBeetsForFarms(
        farmIds,
        account.value
      );

      const pendingRewardTokenForFarms = await masterChefContractsService.rewarders.getPendingRewards(
        farmIds,
        rewarders,
        account.value,
        farms
      );

      for (const userFarm of userFarms) {
        const pendingBeets = pendingBeetsForFarms[userFarm.farmId] || 0;

        decoratedUserFarms.push({
          ...userFarm,
          amount: userFarm.amount,
          rewardDebt: parseFloat(userFarm.rewardDebt),
          beetsHarvested: parseFloat(userFarm.beetsHarvested),
          pendingBeets,
          pendingBeetsValue: pendingBeets * beetsPrice.value,
          pendingRewardTokens: [
            {
              address: networkConfig.addresses.beets,
              symbol: 'BEETS',
              balance: `${pendingBeets}`,
              balanceUSD: `${pendingBeets * beetsPrice.value}`
            },
            ...pendingRewardTokenForFarms[userFarm.farmId]
          ]
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
