<script setup lang="ts">
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';
import { computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useUserPoolsData from '@/beethovenx/composables/useUserPoolsData';

const { fNum } = useNumbers();
const { account } = useWeb3();
const protocolDataQuery = useProtocolDataQuery();
const { userPoolsData, userPoolDataLoading } = useUserPoolsData();

const procotolDataLoading = computed(() => protocolDataQuery.isLoading.value);

const tvl = computed(() => protocolDataQuery.data?.value?.totalLiquidity || 0);
const swapFee24h = computed(
  () => protocolDataQuery.data?.value?.swapFee24h || 0
);
const swapVolume24h = computed(
  () => protocolDataQuery.data?.value?.swapVolume24h || 0
);
</script>

<template>
  <div class="bg-black">
    <div class="px-4 lg:px-6 py-2 flex items-center">
      <div class="flex-1 items-center">
        <span class="mr-4">
          TVL:
          <BalLoadingBlock
            v-if="procotolDataLoading"
            class="w-20 h-4 inline-block"
          />
          <span v-else class="text-green-500">${{ fNum(tvl, 'usd_lg') }}</span>
        </span>
        <span class="mr-4 hidden md:inline">
          Volume (24h):
          <BalLoadingBlock
            v-if="procotolDataLoading"
            class="w-20 h-4 inline-block"
          />
          <span v-else class="text-green-500">
            ${{ fNum(swapVolume24h, 'usd_lg') }}
          </span>
        </span>
        <span class="mr-4 hidden md:inline">
          Fees (24h):
          <BalLoadingBlock
            v-if="procotolDataLoading"
            class="w-16 h-4 inline-block"
          />
          <span v-else class="text-green-500">
            ${{ fNum(swapFee24h, 'usd_lg') }}
          </span>
        </span>
      </div>
      My Portfolio:&nbsp;<span>
        <BalLoadingBlock class="w-16 h-4" v-if="userPoolDataLoading" />
        <template v-else>
          {{ fNum(userPoolsData.totalBalanceUSD, 'usd') }}
        </template>
      </span>
    </div>
  </div>
</template>
