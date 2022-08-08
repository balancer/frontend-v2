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
  t('veBAL.hero.benefits.earn'),
]);

/**
 * METHODS
 */
function navigateToGetVeBAL() {
  router.push({
    name: 'get-vebal',
    query: {
      returnRoute: 'vebal',
    },
  });
}
</script>

<template>
  <div class="hero-container">
    <div class="hero-content">
      <div
        class="py-8 lg:py-4 px-4 lg:px-8 2xl:px-0 xl:pt-0 max-w-md hero-text"
      >
        <p class="font-medium eyebrow">veBAL</p>
        <h1 class="mb-5 text-white title">
          {{ $t('veBAL.hero.title') }}
        </h1>
        <ul>
          <li
            v-for="(benefit, i) in benefits"
            :key="i"
            class="flex items-center mb-2 text-white"
          >
            – {{ benefit }}
          </li>
        </ul>
        <div class="flex mt-6">
          <BalBtn class="mr-3 hero-btn btn-gold" @click="navigateToGetVeBAL">
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
        <div class="group coin">
          <div class="w-full coin-wrapper">
            <BalImage
              class="graphic"
              width="330"
              height="377"
              :src="require('@/assets/images/coins/coins-1.png')"
              alt="BAL and WETH tokens"
            />
          </div>
          <div class="font-semibold caption">
            <p
              class="inline mr-1 text-sm lg:text-base tracking-tighter lg:tracking-normal"
            >
              {{ $t('veBAL.hero.tokens.balWETH') }}
            </p>
            <BalTooltip iconSize="xs" textAlign="left" class="mt-1 font-medium">
              {{ $t('veBAL.hero.tokenInfo.balWETH') }}
            </BalTooltip>
          </div>
        </div>
        <div class="group coin">
          <div class="coin-wrapper">
            <BalImage
              class="graphic"
              width="330"
              height="377"
              :src="require('@/assets/images/coins/coins-2.png')"
              alt="B-80BAL-20WETH LP token"
            />
          </div>
          <div class="font-semibold caption">
            <p
              class="inline mr-1 text-sm lg:text-base tracking-tighter lg:tracking-normal"
            >
              {{ $t('veBAL.hero.tokens.lpToken') }}
            </p>
            <BalTooltip iconSize="xs" textAlign="left" class="mt-1">
              {{ $t('veBAL.hero.tokenInfo.lpToken') }}
            </BalTooltip>
          </div>
        </div>
        <div class="group coin">
          <div class="coin-wrapper">
            <BalImage
              class="graphic"
              width="330"
              height="377"
              :src="require('@/assets/images/coins/coins-3.png')"
              alt="veBAL token"
            />
          </div>
          <div class="font-semibold caption">
            <p
              class="inline mr-1 text-sm lg:text-base tracking-tighter lg:tracking-normal"
            >
              {{ $t('veBAL.hero.tokens.veBAL') }}
            </p>
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
  @apply flex content-center relative w-full;

  min-height: 440px;
  z-index: 0;
  background-color: #0b0f19;
}

.dark .hero-container {
  background-color: #0e1420;
}

.hero-container::before {
  content: ' ';
  background-image: url('/images/patterns/fish-scale.png');
  background-repeat: repeat;

  @apply block absolute left-0 top-0 w-full h-full opacity-10 z-0;
}

.dark .hero-container::before {
  opacity: 0.07;
}

.hero-container::after {
  content: ' ';
  background: linear-gradient(45deg, rgb(0 0 0 / 100%), rgb(0 0 0 / 50%)),
    url('/images/backgrounds/vebal-hero-noise.svg');

  @apply block absolute left-0 top-0 w-full h-full bg-no-repeat bg-cover opacity-20 z-0;

  min-height: 440px;
}

.hero-content {
  @apply flex flex-col md:flex-row md:items-center max-w-screen-2xl mx-auto md:gap-4 lg:gap-8 py-4 md:py-8
    xl:pl-4 w-full z-10;
}

.eyebrow {
  @apply mb-4;

  color: #ccb373;
  background: linear-gradient(#ccb373, #977622);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-text {
  @apply opacity-0;

  animation: fadeIn 1s ease-out 0.1s both;
}

.title {
  @apply max-w-sm;
}

.hero-btn {
  min-width: 140px;
}

.btn-gold {
  background: linear-gradient(45deg, #977622, #ccb373);
  transition: 0.5s all ease-in-out;
}

.btn-gold:hover {
  background: linear-gradient(-45deg, #ae8d39, #684e09);
}

.coins {
  @apply flex lg:gap-8 px-1 lg:px-0;

  flex-grow: 1;
}

.coin-wrapper {
  aspect-ratio: 7 / 8;
}

.coin {
  @apply w-full flex flex-col items-center justify-end relative;
}

.graphic {
  @apply transition-transform duration-300 relative;
}

.coin:hover .graphic {
  transform: translateY(-8px);
}

.caption {
  @apply text-sm md:text-base text-gray-400 transition-colors text-center group-hover:text-white;

  animation: fadeInMoveUp 0.5s ease-out 0.15s both;
}

@media (min-width: 768px) {
  .hero-text {
    min-width: 400px;
  }
}

.caption .bal-icon {
  animation: fadeInMoveUp 0.5s ease-out 0.15s both;
}
</style>
