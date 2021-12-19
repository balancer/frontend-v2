<script setup lang="ts">
import { computed, ref } from 'vue';
import useTokens from '@/composables/useTokens';
import BalTable, {
  ColumnDefinition
} from '@/components/_global/BalTable/BalTable.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import useNumbers from '@/composables/useNumbers';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import { useRouter } from 'vue-router';
import useLgesQuery from '@/beethovenx/lbp/composables/useLgesQuery';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { watch } from 'vue';
import { formatDistanceToNow, parseISO, isBefore, isAfter } from 'date-fns';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import { orderBy } from 'lodash';
import usePools from '@/composables/pools/usePools';

const { tokens, loading, injectTokens } = useTokens();
const { fNum } = useNumbers();
const router = useRouter();

const { pools } = usePools();
const { data, isLoading, isIdle, isError } = useLgesQuery();

const tokenAddresses = computed(() => {
  return (data.value || []).map(lge => lge.tokenContractAddress);
});

const columns = ref<ColumnDefinition<GqlLge>[]>([
  {
    name: 'Project',
    id: 'name',
    accessor: 'name',
    width: 200
  },
  {
    name: 'Token',
    id: 'token',
    accessor: 'token',
    width: 200,
    Cell: 'tokenCell'
  },
  {
    name: 'Status',
    id: 'status',
    accessor: 'status',
    Cell: 'statusCell',
    sortKey: 'startDate',
    width: 200
  },
  /*{
    name: 'Volume',
    id: 'volume',
    accessor: 'volume',
    sortKey: 'volume',
    Cell: 'volumeCell',
    align: 'right',
    width: 125
  },*/
  {
    name: 'Links',
    id: 'links',
    accessor: 'links',
    Cell: 'linksCell',
    width: 125
  }
]);

function handleRowClick(lge: GqlLge) {
  router.push({ name: 'lge', params: { id: lge.id } });
}

watch(tokenAddresses, updated => {
  injectTokens(updated);
});

const tabs = [
  { value: 'active-upcoming', label: 'Active & Upcoming' },
  { value: 'previous', label: 'Previous' }
];

const activeTab = ref(tabs[0].value);

const visibleLges = computed(() => {
  const now = new Date();

  const lges = (data.value || []).filter(lge => {
    return activeTab.value === 'active-upcoming'
      ? isBefore(now, parseISO(lge.endDate))
      : isAfter(now, parseISO(lge.endDate));
  });

  lges.forEach(lge => {
    console.log(
      lge.id,
      pools.value?.find(pool => pool.id === lge.id)
    );
  });

  return activeTab.value === 'active-upcoming'
    ? orderBy(lges, 'startDate', 'asc')
    : orderBy(lges, 'endDate', 'desc');
});
</script>

<template>
  <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
  <BalCard
    v-if="!loading"
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :is-loading="isLoading"
      :columns="columns"
      :data="visibleLges"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :isSortable="false"
      :is-paginated="false"
      :isLoadingMore="false"
      :on-row-click="handleRowClick"
    >
      <template v-slot:tokenCell="auction">
        <div class="flex items-center px-4">
          <BalAsset
            :address="auction.tokenContractAddress"
            :iconURI="auction.tokenIconUrl"
          />
          <span class="ml-2">
            {{ tokens[auction.tokenContractAddress]?.symbol }}
          </span>
        </div>
      </template>
      <template v-slot:statusCell="auction">
        <div class="flex items-center px-4">
          <div
            :class="[
              'w-3.5 h-3.5 rounded-full mr-2',
              isBefore(new Date(), parseISO(auction.startDate))
                ? 'bg-yellow-500'
                : isAfter(new Date(), parseISO(auction.endDate))
                ? 'bg-gray-500'
                : 'bg-green-500'
            ]"
          />
          {{
            isBefore(new Date(), parseISO(auction.startDate))
              ? `Starts in ${formatDistanceToNow(parseISO(auction.startDate))}`
              : isAfter(new Date(), parseISO(auction.endDate))
              ? `Ended ${formatDistanceToNow(parseISO(auction.endDate))} ago`
              : `Ends in ${formatDistanceToNow(parseISO(auction.endDate))}`
          }}
        </div>
      </template>
      <template v-slot:volumeCell="auction">
        <div class="px-4 text-right">
          {{ pools?.find(pool => pool.id === auction.id)?.totalSwapVolume }}
        </div>
      </template>
      <template v-slot:linksCell="auction">
        <div class="flex items-center px-6">
          <a :href="auction.websiteUrl" target="_blank" class="mr-2">
            <BalIcon name="globe" />
          </a>
          <a
            v-if="auction.twitterUrl"
            :href="auction.twitterUrl"
            target="_blank"
            class="mr-2 -mt-1"
          >
            <img
              src="~@/beethovenx/assets/images/twitter.svg"
              :style="{ width: '20px', 'max-width': '20px' }"
            />
          </a>
          <a
            v-if="auction.discordUrl"
            :href="auction.discordUrl"
            target="_blank"
            class="-mt-1 mr-2"
          >
            <img
              src="~@/beethovenx/assets/images/discord.svg"
              :style="{ width: '20px', 'max-width': '20px' }"
            />
          </a>
          <a
            v-if="auction.telegramUrl"
            :href="auction.telegramUrl"
            target="_blank"
            class="-mt-1 mr-2"
          >
            <img
              src="~@/beethovenx/assets/images/telegram.svg"
              :style="{ width: '20px', 'max-width': '20px' }"
            />
          </a>
          <a
            v-if="auction.mediumUrl"
            :href="auction.mediumUrl"
            target="_blank"
            class="-mt-1 mr-2"
          >
            <img
              src="~@/beethovenx/assets/images/medium.svg"
              :style="{ width: '20px', 'max-width': '20px' }"
            />
          </a>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
