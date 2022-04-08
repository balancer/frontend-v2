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
  <div class="w-full bg-gray-850 hero-container">
    <div class="hero-content">
      <div
        class="hero-text py-8 lg:py-4 xl:pt-0 px-4 lg:px-8 2xl:px-0 max-w-md"
      >
        <p class="text-white font-medium mb-3">
          {{ $t('veBAL.hero.eyebrow') }}
        </p>
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
            class="mr-3 hero-btn"
          >
            {{ $t('veBAL.hero.buttons.getVeBAL') }}
          </BalBtn>
          <BalBtn
            tag="a"
            href="https://docs.balancer.fi/ecosystem/vebal-and-gauges"
            target="_blank"
            rel="noreferrer"
            color="white"
            class="hero-btn"
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
      <div class="coins">
        <div class="coin group">
          <div class="coin-wrapper w-full">
            <BalImage
              class="graphic"
              width="330"
              height="377"
              :src="require('@/assets/images/coins/coins-1.png')"
              alt="BAL and WETH tokens"
            />
          </div>
          <div class="caption">
            <p class="inline mr-1">{{ $t('veBAL.hero.tokens.balWETH') }}</p>
            <BalTooltip iconSize="xs" textAlign="left" class="mt-1">
              {{ $t('veBAL.hero.tokenInfo.balWETH') }}
            </BalTooltip>
          </div>
        </div>
        <div class="coin group">
          <div class="coin-wrapper">
            <BalImage
              class="graphic"
              width="330"
              height="377"
              :src="require('@/assets/images/coins/coins-2.png')"
              alt="B-80BAL-20WETH LP token"
            />
          </div>
          <div class="caption">
            <p class="inline mr-1">{{ $t('veBAL.hero.tokens.lpToken') }}</p>
            <BalTooltip iconSize="xs" textAlign="left" class="mt-1">
              {{ $t('veBAL.hero.tokenInfo.lpToken') }}
            </BalTooltip>
          </div>
        </div>
        <div class="coin group">
          <div class="coin-wrapper">
            <BalImage
              class="graphic"
              width="330"
              height="377"
              :src="require('@/assets/images/coins/coins-3.png')"
              alt="veBAL token"
            />
          </div>
          <div class="caption">
            <p class="inline mr-1">{{ $t('veBAL.hero.tokens.veBAL') }}</p>
            <BalTooltip iconSize="xs" textAlign="left" class="mt-1">
              {{ $t('veBAL.hero.tokenInfo.veBAL') }}
            </BalTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.hero-container {
  background-image: url('/images/backgrounds/spirograph.svg');
  background-repeat: no-repeat;
  background-position-x: right;
  background-size: cover;
  min-height: 440px;
  @apply flex content-center;
}
.hero-content {
  @apply flex flex-col md:flex-row md:items-center max-w-screen-2xl mx-auto md:gap-4 lg:gap-8 py-4 md:py-8 w-full;
}
.hero-text {
  opacity: 0;
  animation: fadeIn 1s ease-out 0.1s both;
}
.title {
  max-width: 820px;
}
.hero-btn {
  min-width: 140px;
}
.coins {
  @apply flex lg:gap-8;
  flex-grow: 1;
}
.coin-wrapper {
  aspect-ratio: 7 / 8;
}
.coin {
  @apply w-full flex flex-col items-center justify-end;
}

.coin:hover .graphic {
  transform: translateY(-8px);
}
.graphic {
  @apply transition-transform duration-300;
}
.caption {
  @apply font-semibold text-sm md:text-base text-gray-400 transition-colors text-center group-hover:text-white;
  animation: fadeInMoveUp 0.5s ease-out 0.15s both;
}

@media (min-width: 768px) {
  .hero-text {
    min-width: 400px;
  }
}
</style>

<style>
.caption .bal-icon {
  animation: fadeInMoveUp 0.5s ease-out 0.15s both;
}
</style>
