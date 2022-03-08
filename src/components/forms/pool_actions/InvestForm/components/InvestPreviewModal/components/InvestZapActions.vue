<script setup lang="ts">
import { FullPool, PoolType } from '@/services/balancer/subgraph/types';
import BalToggle from '@/components/_global/BalToggle/BalToggle.vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import { computed, onBeforeMount } from 'vue';
import useConfig from '@/composables/useConfig';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
};

const { networkConfig } = useConfig();

const props = withDefaults(defineProps<Props>(), {});
const { stakeBptInFarm } = useInvestState();

const poolSupportsZapping = computed(() => {
  if (!props.pool.farm) {
    return false;
  }

  if (props.pool.poolType !== PoolType.Weighted) {
    return false;
  }

  return true;
});

const isFBeetsPool = computed(
  () => networkConfig.fBeets.poolId === props.pool.id
);

function toggleStakeBptInFarm() {
  stakeBptInFarm.value = !stakeBptInFarm.value;
}

onBeforeMount(() => {
  if (props.pool.farm && props.pool.poolType === PoolType.Weighted) {
    stakeBptInFarm.value = true;
  } else {
    stakeBptInFarm.value = false;
  }
});
</script>

<template>
  <div
    v-if="poolSupportsZapping"
    class="border rounded-lg border-gray-700 mt-3"
  >
    <div class="flex py-3 px-2 highlight items-center leading-5 text-base">
      <div class="pr-4">
        <BalToggle
          name="active"
          :checked="stakeBptInFarm"
          @toggle="toggleStakeBptInFarm"
        />
      </div>
      <template v-if="isFBeetsPool">
        <div class="flex-auto">
          Mint fBEETS and Deposit them directly into the farm with ZAP.
        </div>
        <BalTooltip
          text="With ZAP enabled, your BPT will be converted to fBEETS and automatically deposited to the farm, saving time & maximizing yield."
          icon-size="md"
          class="ml-2"
        />
      </template>
      <template v-else>
        <div class="flex-auto">
          Deposit my BPTs directly into the farm with ZAP.
        </div>
        <BalTooltip
          text="With ZAP enabled, your investment BPTs are automatically deposited to the farm, saving time & maximizing yield."
          icon-size="md"
          class="ml-2"
        />
      </template>
    </div>
  </div>
</template>
