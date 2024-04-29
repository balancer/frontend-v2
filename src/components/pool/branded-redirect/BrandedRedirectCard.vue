<script setup lang="ts">
import { BRANDED_REDIRECT_DATA } from './constants';
import { POOLS } from '@/constants/pools';
import { PoolType } from '@/services/pool/types';

const props = defineProps<{
  poolId: string;
  poolType: PoolType | undefined;
}>();

const redirectData = computed(() => {
  if (!props.poolType) return;
  const brand = POOLS.BrandedRedirect?.[props.poolType];
  if (!brand) return;
  return BRANDED_REDIRECT_DATA[brand];
});

const hasBannerImage = computed<boolean>(() => {
  return typeof redirectData.value?.buildBannerPath === 'function';
});

const bannerSrc = computed<string>(() => {
  //@ts-ignore
  if (hasBannerImage.value) return redirectData.value.buildBannerPath();
  return '';
});

const brandLink = computed<string>(() => {
  return redirectData.value?.link(props.poolId, props.poolType) || '';
});
</script>

<template>
  <BalStack v-if="redirectData" vertical>
    <BalCard shadow="2xl" noPad class="rounded-xl" growContent>
      <div class="flex flex-col items-center">
        <img v-if="hasBannerImage" :src="bannerSrc" :alt="redirectData.title" />
        <div class="py-4 px-6 w-full">
          <div class="mb-1.5 text-lg font-semibold">
            {{ $t(redirectData.title) }}
          </div>
          <div class="mb-3">
            {{ $t(redirectData.description) }}
          </div>
          <BalBtn
            v-if="brandLink"
            color="blue"
            block
            tag="a"
            :href="brandLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t(redirectData.btnText) }}
            <BalIcon name="arrow-up-right" size="sm" class="ml-2" />
          </BalBtn>
        </div>
      </div>
    </BalCard>
  </BalStack>
</template>
