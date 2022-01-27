<template>
  <BalCard>
    <div class="text-sm text-gray-500 font-medium mb-2">
      My Pending Rewards
    </div>
    <div
      v-if="hasBeetsRewards"
      class="text-xl font-medium truncate flex items-center"
    >
      {{ fNum(pendingBeets, 'token_fixed') }} BEETS
    </div>
    <div
      v-if="hasThirdPartyRewards"
      class="text-xl font-medium truncate flex items-center"
    >
      {{ fNum(pendingRewardToken, 'token_fixed') }} {{ rewardTokenSymbol }}
    </div>
    <div class="truncate flex items-center pb-8">
      {{ fNum(pendingBeetsValue + pendingRewardTokenValue, 'usd') }}
    </div>

    <BalBtn
      label="Harvest"
      block
      color="gradient"
      :disabled="pendingBeets <= 0 && pendingRewardToken <= 0"
      :loading="harvesting"
      @click.prevent="harvestRewards"
    />
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import useFarm from '@/beethovenx/composables/farms/useFarm';
import useFarmUser from '@/beethovenx/composables/farms/useFarmUser';

export default defineComponent({
  name: 'FarmHarvestRewardsCard',

  components: {},

  props: {
    hasBeetsRewards: {
      type: Boolean,
      required: true
    },
    hasThirdPartyRewards: {
      type: Boolean,
      required: true
    },
    pendingBeets: {
      type: Number,
      required: true
    },
    pendingRewardToken: {
      type: Number,
      required: true
    },
    pendingBeetsValue: {
      type: Number,
      required: true
    },
    pendingRewardTokenValue: {
      type: Number,
      required: true
    },
    farmId: {
      type: String,
      required: true
    },
    tokenAddress: {
      type: String,
      required: true
    },
    rewardTokenSymbol: {
      type: String
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { harvest } = useFarm(ref(props.tokenAddress), ref(props.farmId));
    const harvesting = ref(false);
    const { farmUserRefetch } = useFarmUser(props.farmId);

    async function harvestRewards(): Promise<void> {
      harvesting.value = true;
      const tx = await harvest();

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await farmUserRefetch.value();
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    return {
      fNum,
      harvestRewards,
      harvesting
    };
  }
});
</script>
