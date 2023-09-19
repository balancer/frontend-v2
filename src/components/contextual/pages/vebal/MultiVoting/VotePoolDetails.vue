<script lang="ts" setup>
import BalChipExpired from '@/components/chips/BalChipExpired.vue';
import BalChipNew from '@/components/chips/BalChipNew.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import { getNetworkSlug } from '@/composables/useNetwork';
import { isStableLike, isUnknownType } from '@/composables/usePoolHelpers';
import { orderedGaugeTokens } from '@/composables/useVotingPools';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { useVoting } from '../providers/voting.provider';
import { isGaugeNew } from '../voting-utils';

type Props = {
  pool: VotingPool;
};
defineProps<Props>();

const { getIsGaugeExpired } = useVoting();
</script>

<template>
  <div class="flex items-center py-2 px-3">
    <div
      class="flex justify-center items-center w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded shadow-sm"
    >
      <img
        :src="buildNetworkIconURL(getNetworkSlug(pool.network))"
        :alt="pool.network.toString()"
        class="w-6 h-6"
      />
    </div>

    <TokenPills
      class="pl-6 font-semibold"
      :tokens="orderedGaugeTokens(pool)"
      :isStablePool="
        isStableLike(pool.poolType) || isUnknownType(pool.poolType)
      "
    />
    <BalChipNew v-if="isGaugeNew(pool)" class="ml-2" />
    <BalChipExpired v-if="getIsGaugeExpired(pool.gauge.address)" class="ml-2" />
  </div>
</template>