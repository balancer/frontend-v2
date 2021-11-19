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
    <div>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My Pending Rewards
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(farm.pendingBeets, 'token_fixed') }} BEETS
        </div>
        <div
          v-if="farm.pendingRewardToken > 0"
          class="text-xl font-medium truncate flex items-center"
        >
          {{ fNum(farm.pendingRewardToken, 'token_fixed') }} HND
        </div>
        <div class="truncate flex items-center pb-8">
          {{
            fNum(farm.pendingBeetsValue + farm.pendingRewardTokenValue, 'usd')
          }}
        </div>

        <BalBtn
          label="Harvest"
          block
          color="gradient"
          :disabled="farm.pendingBeets <= 0 && farm.pendingRewardToken <= 0"
          :loading="harvesting"
          @click.prevent="harvestRewards"
        />
      </BalCard>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
import useEthers from '@/composables/useEthers';
import { DecoratedFarm } from '@/beethovenx/services/subgraph/subgraph-types';
import useFarm from '@/beethovenx/composables/farms/useFarm';
import useFarmUserQuery from '@/beethovenx/composables/farms/useFarmUserQuery';

export default defineComponent({
  components: {
    LiquidityMiningTooltip
  },

  props: {
    farm: {
      type: Object as PropType<DecoratedFarm>,
      required: true
    },
    tokenAddress: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { harvest } = useFarm(ref(props.tokenAddress), ref(props.farm.id));
    const harvesting = ref(false);
    const farmUserQuery = useFarmUserQuery(props.farm.id);
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
      const farm = props.farm;

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
