<script setup lang="ts">
import { FullPool, PoolType } from '@/services/balancer/subgraph/types';
import BalToggle from '@/components/_global/BalToggle/BalToggle.vue';
import useInvestState from '@/components/forms/pool_actions/InvestForm/composables/useInvestState';
import { onBeforeMount } from 'vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
};

const fidellioDuettoId =
  '0xcde5a11a4acb4ee4c805352cec57e236bdbc3837000200000000000000000019';
const props = withDefaults(defineProps<Props>(), {});
const { stakeBptInFarm } = useInvestState();

function toggleStakeBptInFarm() {
  stakeBptInFarm.value = !stakeBptInFarm.value;
}

onBeforeMount(() => {
  if (
    props.pool.farm &&
    props.pool.poolType === PoolType.Weighted &&
    props.pool.id !== fidellioDuettoId
  ) {
    stakeBptInFarm.value = true;
  } else {
    stakeBptInFarm.value = false;
  }
});
</script>

<template>
  <div
    v-if="
      props.pool.farm &&
        props.pool.poolType === PoolType.Weighted &&
        props.pool.id !== fidellioDuettoId
    "
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
      <div class="flex-auto">
        Deposit my BPTs directly into the farm with ZAP.
      </div>
      <BalTooltip
        text="With ZAP enabled, your investment BPTs are automatically deposited to the farm, saving time & maximizing yield."
        icon-size="md"
        class="ml-2"
      />
    </div>
  </div>
</template>
