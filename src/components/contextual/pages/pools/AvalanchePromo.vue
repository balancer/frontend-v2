<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
const { networkSlug } = useNetwork();
</script>

<template>
  <section
    v-if="networkSlug != 'avalanche'"
    class="box-border overflow-hidden px-4 xl:px-0 mr-6 mb-8 w-full rounded-xl promo"
  >
    <div class="promo-bg">
      <div
        class="flex flex-col lg:flex-row lg:justify-between lg:items-end p-4"
      >
        <div class="z-10 max-w-3xl">
          <h5 class="mb-1 font-bold text-white">
            Balancer is live on Avalanche, featuring Xave FX pools!
          </h5>
          <p class="md:text-sm leading-6 text-white">
            Avalanche is a network to launch DeFi apps and enterprise blockchain
            deployments in one interoperable, scalable&nbsp;ecosystem.
          </p>
        </div>
        <div class="z-10 mt-4">
          <div class="promo-btn">
            <router-link to="/avalanche">
              <div class="flex items-center">
                <img
                  src="~@/assets/images/icons/networks/avalanche-light.svg"
                  width="24"
                  class="mr-1.5"
                />
                Launch Avalanche
              </div></router-link
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.promo-bg {
  background: url('/images/backgrounds/avalanche-pattern.svg'),
    linear-gradient(67deg, #302022 0%, #ca241f 100%);
  @apply transition-all duration-1000 rounded-xl overflow-hidden relative bg-cover h-auto bg-no-repeat w-full bg-center;
}

.promo-bg::after {
  content: '';
  background: inherit;
  @apply absolute top-0 right-0 bottom-0 left-0 bg-cover origin-center transition-all duration-500 ease-out;
}

.promo-bg:hover::after {
  @apply scale-110;
}

.promo-btn {
  @apply text-white text-sm border border-white p-2 rounded-lg bg-black/10 hover:bg-black/20 focus:bg-black/20 transition-colors inline-block cursor-pointer;

  font-variation-settings: 'wght' 600;
}
</style>
