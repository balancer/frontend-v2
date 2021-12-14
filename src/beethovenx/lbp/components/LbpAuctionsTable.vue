<script setup lang="ts">
import { computed, ref } from 'vue';
import { LBPDefaultData } from '@/beethovenx/lbp/composables/useLbpState';
import useTokens from '@/composables/useTokens';
import BalTable, {
  ColumnDefinition
} from '@/components/_global/BalTable/BalTable.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { LbpData } from '@/beethovenx/lbp/lbp-types';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import useNumbers from '@/composables/useNumbers';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import { useRouter } from 'vue-router';

const { tokens, loading } = useTokens();
const { fNum } = useNumbers();
const router = useRouter();

const columns = ref<ColumnDefinition<LbpData & { volume: string }>[]>([
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
    width: 150,
    Cell: 'tokenCell'
  },
  {
    name: 'Status',
    id: 'status',
    accessor: 'name',
    Cell: 'statusCell',
    width: 150
  },
  {
    name: 'Volume',
    id: 'volume',
    accessor: auction => fNum(auction.volume, 'usd'),
    sortKey: 'volume',
    width: 150
  },
  {
    name: 'Links',
    id: 'links',
    accessor: 'links',
    Cell: 'linksCell',
    width: 100
  }
]);

const data = computed(() => [
  { ...LBPDefaultData, volume: '240000' },
  { ...LBPDefaultData, volume: '240000' },
  { ...LBPDefaultData, volume: '240000' },
  { ...LBPDefaultData, volume: '240000' },
  { ...LBPDefaultData, volume: '240000' },
  { ...LBPDefaultData, volume: '240000' },
  { ...LBPDefaultData, volume: '240000' }
]);

function handleRowClick(auction: LbpData) {
  router.push({ name: 'auction', params: { id: 'some-id' } });
}
</script>

<template>
  <BalCard
    v-if="!loading"
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="data"
      :is-loading="false"
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
            {{ tokens[auction.tokenContractAddress].symbol }}
          </span>
        </div>
      </template>
      <template v-slot:statusCell>
        <div class="flex items-center px-4">
          Starts in 2 hours
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
            <img src="~@/beethovenx/assets/images/twitter.svg" class="w-5" />
          </a>
          <a
            v-if="auction.discordUrl"
            :href="auction.discordUrl"
            target="_blank"
            class="-mt-1"
          >
            <img src="~@/beethovenx/assets/images/discord.svg" class="w-5" />
          </a>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
