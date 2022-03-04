<script setup lang="ts">
import useSubgraphQuery from '@/composables/subgraph/useSubgraphQuery';
import QUERY_KEYS from '@/constants/queryKeys';
import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, reactive, ref } from 'vue';
import { useQuery } from 'vue-query';

/** TYPES */
type Props = {
  userPools: FullPool[];
};

type UserGuageShare = {
  id: string;
  poolId: string;
};

type UserGuageSharesResponse = {
  gaugeShares: UserGuageShare[];
};

const props = withDefaults(defineProps<Props>(), {
  userPools: () => []
});

/** QUERY ARGS */
const userPoolsAddresses = computed(() => {
  return props.userPools.map(pool => pool.address);
});

/** COMPOSABLES */
const { account } = useWeb3();
const { data: gaugeShares, isLoading: isLoadingGaugeShares } = useSubgraphQuery<
  UserGuageSharesResponse
>({
  subgraph: 'gauge',
  key: QUERY_KEYS.Gauges.GaugeShares.User(account),
  query: {
    gaugeShares: {
      __args: {
        where: { user: account.value.toLowerCase() }
      },
      gauge: {
        poolId: 1
      }
    }
  }
});

// const { data } = useSubgraphQuery<UserGuageSharesResponse>({
//   subgraph: 'gauge',
//   key: reactive(['bing', { userPoolsAddresses }]),
//   query: reactive({
//     liquidityGauges: {
//       __args: {
//         where: {
//           poolId_in: userPoolsAddresses.value
//         }
//       }
//     }
//   })
// });

// const d = useQuery(['ding', { userPoolsAddresses }], () => {
//     console.log('bingbong', userPoolsAddresses.value);
//     return 1;
// })
</script>

<template>
  <BalStack vertical spacing="sm">
    <h5>{{ $t('poolsToStake') }}</h5>
    <!-- <PoolsTable
      :key="stakableUserPools"
      :isLoading="isLoadingUserPools"
      :data="migratableUserPools"
      :noPoolsLabel="$t('noInvestments')"
      showPoolShares
      :selectedTokens="selectedTokens"
      :hiddenColumns="['poolVolume', 'poolValue', 'migrate']"
      class="mb-8"
    /> -->
  </BalStack>
</template>
