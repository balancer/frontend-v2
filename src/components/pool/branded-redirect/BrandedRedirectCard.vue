<script setup lang="ts">
import { BRANDED_REDIRECTS } from './constants';

const props = defineProps<{
  poolId: string;
}>();

const redirectData = computed(() => {
  return BRANDED_REDIRECTS[props.poolId];
});

function openRedirectLink() {
  window.open(redirectData.value.link, '_blank');
}
</script>

<template>
  <BalStack vertical>
    <BalCard shadow="2xl" noPad class="rounded-xl">
      <div>logo</div>
      <div class="px-6 pb-4">
        <div class="mb-1.5 text-lg font-semibold">
          {{ $t(redirectData.title) }}
        </div>
        <div class="mb-3">
          {{ $t(redirectData.description) }}
        </div>
        <BalBtn
          color="blue"
          :label="$t(redirectData.btnText)"
          block
          @click="openRedirectLink"
        />
      </div>
    </BalCard>
  </BalStack>
</template>