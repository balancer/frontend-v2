<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useDarkMode from '@/composables/useDarkMode';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const router = useRouter();

/**
 * COMPUTED
 */
const benefits = computed(() => [
  t('veBAL.hero.benefits.boost'),
  t('veBAL.hero.benefits.vote'),
  t('veBAL.hero.benefits.earn')
]);

/**
 * METHODS
 */
function navigateToGetVeBAL() {
  router.push({
    name: 'get-vebal',
    query: {
      returnRoute: 'vebal'
    }
  });
}
</script>

<template>
  <div class="px-2 lg:px-0 w-full bg-gray-850">
    <div class="flex flex-col md:flex-row md:items-center">
      <div class="py-4 px-4">
        <img src="~@/assets/images/hero-veBAL.png" class="max-w-full" />
      </div>
      <div class="pt-4 md:pt-8 xl:pt-0 px-4 lg:px-12 xl:pl-0 py-8 lg:py-4">
        <h1 class="title mb-6 text-white">{{ $t('veBAL.hero.title') }}</h1>
        <div
          v-for="(benefit, i) in benefits"
          :key="i"
          class="flex items-center mb-2 text-white"
        >
          <BalIcon name="check" class="text-green-500 mr-2" />
          {{ benefit }}
        </div>
        <div class="flex mt-6">
          <BalBtn
            color="gradient"
            @click="navigateToGetVeBAL"
            class="mr-3 primary-btn"
          >
            {{ $t('veBAL.hero.buttons.getVeBAL') }}
          </BalBtn>
          <BalBtn
            tag="a"
            href="https://forum.balancer.fi/t/introducing-vebal-tokenomics/2512"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
          >
            {{ $t('veBAL.hero.buttons.learnMore') }}
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="ml-px group-hover:text-pink-500 transition-colors"
            />
          </BalBtn>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.title {
  max-width: 820px;
}
.primary-btn {
  min-width: 132px;
}
</style>
