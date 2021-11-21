<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="text-sm text-gray-500 font-medium mb-2">
          {{ stat.label }}
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ stat.value }}
          <LiquidityMiningTooltip :pool="pool" v-if="stat.id === 'apr'" />
        </div>
      </BalCard>
    </div>
    <FarmHarvestRewardsCard
      :farm-id="pool.farm.id"
      :token-address="pool.address"
      :pending-beets="pool.farm.pendingBeets"
      :pending-beets-value="pool.farm.pendingBeetsValue"
      :pending-reward-token="pool.farm.pendingRewardToken"
      :pending-reward-token-value="pool.farm.pendingRewardTokenValue"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import useEthers from '@/composables/useEthers';
import {
  DecoratedFarm,
  DecoratedPoolWithFarm,
  DecoratedPoolWithRequiredFarm
} from '@/beethovenx/services/subgraph/subgraph-types';
import useFarm from '@/beethovenx/composables/farms/useFarm';
import useFarmUserQuery from '@/beethovenx/composables/farms/useFarmUserQuery';
import FarmHarvestRewardsCard from '@/beethovenx/components/pages/farm/FarmHarvestRewardsCard.vue';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  components: {
    FarmHarvestRewardsCard,
    LiquidityMiningTooltip
  },

  props: {
    pool: {
      type: Object as PropType<DecoratedPoolWithRequiredFarm>,
      required: true
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { harvest } = useFarm(
      ref(props.pool.address),
      ref(props.pool.farm.id)
    );
    const harvesting = ref(false);
    const farmUserQuery = useFarmUserQuery(props.pool.farm.id);
    const farmUser = computed(() => farmUserQuery.data.value);

    async function harvestRewards(): Promise<void> {
      harvesting.value = true;
      const tx = await harvest();

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await farmUserQuery.refetch.value();
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    // COMPUTED
    const stats = computed(() => {
      const farm = props.pool.farm;

      return [
        {
          id: 'tvl',
          label: 'TVL',
          value: fNum(farm.tvl, 'usd')
        },
        {
          id: 'beets',
          label: 'BEETS',
          value: `${fNum(farm.rewards, 'token_lg')} / day`
        },
        {
          id: 'stake',
          label: 'My Balance',
          value: fNum(farm.stake, 'usd')
        },
        {
          id: 'your_share',
          label: 'My Share',
          value: fNum(farm.share, 'percent')
        }
      ];
    });

    const pendingRewards = computed(() => {
      return {
        count: farmUser.value?.pendingBeets || 0,
        value: farmUser.value?.pendingBeetsValue || 0
      };
    });

    return {
      stats,
      pendingRewards,
      fNum,
      harvestRewards,
      harvesting
    };
  }
});
</script>
