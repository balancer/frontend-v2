<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const router = useRouter();

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
  <div class="px-3 md:px-0 md:w-1/2">
    <h3>{{ $t('veBAL.hero.title') }}</h3>
    <div v-for="(benefit, i) in benefits" :key="i" class="flex items-center">
      <BalIcon name="check" class="text-green-500 mr-2" />
      {{ benefit }}
    </div>
    <div class="flex mt-3">
      <BalBtn color="gradient" @click="navigateToGetVeBAL" class="mr-3">
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
</template>
