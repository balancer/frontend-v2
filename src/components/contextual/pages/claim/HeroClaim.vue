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
  <div class="bg">
    <div class="w-full hero-container">
      <div class="hero-content">
        <div class="hero-text fade-in-slow">
          <h1 class="title mb-3 text-white">
            {{ $t('claimHero.title') }}
          </h1>
          <p class="text-white pb-0 font-medium">
            {{ $t('claimHero.description') }}
          </p>
        </div>
      </div>
      <div class="hero-graphic-container">
        <div
          class="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4 xl:gap-12 items-center w-full fade-in-slow"
        >
          <div class="tip group">
            <img
              class="tip-icon"
              src="@/assets/images/icons/claims-header/add-liquidity.svg"
            />
            <p class="tip-label font-semibold">
              <!-- <span class="tip-number">1</span> -->
              Add liquidity
              <BalTooltip
                iconSize="xs"
                textAlign="left"
                class="relative top-px"
                iconClass="text-white"
                width="60"
              >
                {{ $t('claimHero.tips.addLiquidity') }}
              </BalTooltip>
            </p>
          </div>
          <div class="tip group">
            <img
              class="tip-icon"
              src="@/assets/images/icons/claims-header/stake.svg"
            />
            <p class="tip-label font-semibold">
              Stake to earn
              <BalTooltip
                iconSize="xs"
                textAlign="left"
                class="relative top-px"
                iconClass="text-white"
                width="60"
              >
                {{ $t('claimHero.tips.stake') }}
              </BalTooltip>
            </p>
          </div>
          <div class="tip group">
            <img
              class="tip-icon"
              src="@/assets/images/icons/claims-header/vebal.svg"
            />
            <p class="tip-label font-semibold">
              Get a boost
              <BalTooltip
                iconSize="xs"
                textAlign="left"
                class="relative top-px"
                iconClass="text-white"
                width="60"
              >
                {{ $t('claimHero.tips.boost') }}
              </BalTooltip>
            </p>
          </div>
          <div class="tip group">
            <img
              class="tip-icon"
              src="@/assets/images/icons/claims-header/sparkles.svg"
            />
            <p class="tip-label font-semibold">
              Claim anytime
              <BalTooltip
                iconSize="xs"
                textAlign="left"
                class="relative top-px"
                iconClass="text-white"
                width="60"
              >
                {{ $t('claimHero.tips.claim') }}
              </BalTooltip>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg {
  background: linear-gradient(
    90deg,
    rgba(255, 0, 0, 0.5) 0%,
    rgba(255, 0, 255, 0) 25%
  );
  background-image: url('/images/backgrounds/claims-header.png');
  @apply bg-no-repeat bg-cover bg-center;
}
.hero-container {
  @apply grid grid-cols-1 lg:grid-cols-3 lg:container lg:mx-auto;
}

.hero-graphic-container {
  @apply w-full px-4 py-8 xl:p-8 flex items-center lg:col-span-2;
}

.hero-content {
  @apply px-4 pt-12 lg:p-8 lg:pl-0 flex items-center w-full relative;
}

.hero-text {
  @apply opacity-0;
}

.tip {
  @apply flex flex-col items-center text-center group;
}
.tip-icon {
  @apply pb-4 transition-transform duration-300;
}
.tip-label {
  @apply text-white leading-5 transition-colors;
}

.tip:hover .tip-icon {
  transform: translateY(-8px);
}

.tip-number {
  @apply block pb-1;
}
</style>
