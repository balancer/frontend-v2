<script setup lang="ts">
import { BRANDED_REDIRECT_DATA } from './constants';
import xave from '@/assets/images/branded-redirect-logos/xave.png';
import { POOLS } from '@/constants/pools';

const props = defineProps<{
  poolId: string;
}>();

const redirectData = computed(() => {
  const brand = POOLS.BrandedRedirect?.[props.poolId];
  if (!brand) return;
  return BRANDED_REDIRECT_DATA[brand];
});

function openRedirectLink() {
  const link = redirectData.value?.link;
  if (!link) return;
  window.open(link, '_blank');
}
</script>

<template>
  <BalStack v-if="redirectData" vertical>
    <BalCard shadow="2xl" noPad class="rounded-xl" growContent>
      <div class="flex flex-col items-center">
        <img class="mb-4" :src="xave" :alt="redirectData.title" />
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
      </div>
    </BalCard>
  </BalStack>
</template>