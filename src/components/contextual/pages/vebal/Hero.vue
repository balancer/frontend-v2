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
const { darkMode } = useDarkMode();

/**
 * COMPUTED
 */
const benefits = computed(() => [
  t('veBAL.hero.benefits.earn'),
  t('veBAL.hero.benefits.boost'),
  t('veBAL.hero.benefits.vote')
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
  <div class="px-2 lg:px-0 w-full lg:w-1/2">
    <h1 class="mb-8">{{ $t('veBAL.hero.title') }}</h1>
    <div
      v-for="(benefit, i) in benefits"
      :key="i"
      class="flex items-center mb-2 text-gray-600"
    >
      <BalIcon name="check" class="text-green-500 mr-2" />
      {{ benefit }}
    </div>
    <div class="flex mt-8">
      <BalBtn color="gradient" @click="navigateToGetVeBAL" class="mr-3">
        {{ $t('veBAL.hero.buttons.getVeBAL') }}
      </BalBtn>
      <BalBtn
        tag="a"
        href="https://forum.balancer.fi/t/introducing-vebal-tokenomics/2512"
        target="_blank"
        rel="noreferrer"
        :color="darkMode ? 'white' : 'primary'"
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
</template>
