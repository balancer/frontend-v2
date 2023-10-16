<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
const { networkSlug } = useNetwork();
</script>

<template>
  <section
    v-if="networkSlug != 'base'"
    class="box-border overflow-hidden relative px-4 xl:px-0 mr-6 mb-5 w-full rounded-xl promo"
  >
    <div class="promo-bg">
      <div
        class="flex flex-col lg:flex-row lg:justify-between lg:items-end p-4"
      >
        <div class="z-10 max-w-2xl">
          <h5 class="mb-1 font-bold text-white">Balancer is live on Base!</h5>
          <p class="md:text-sm leading-6 text-white">
            Base from Coinbase, is built as an Ethereum L2, with the security,
            stability, and scalability to power dapps with the aim of making
            Ethereum accessible to&nbsp;everyone.
          </p>
        </div>
        <div class="z-10 mt-4">
          <div class="promo-btn">
            <router-link to="/base">
              <div class="flex items-center">
                <img
                  src="~@/assets/images/icons/networks/base.svg"
                  width="24"
                  class="mr-1.5"
                />
                Launch Base
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
  border-radius: 500px;
  background: rgb(78 78 250);
  @apply transition-all duration-1000 rounded-xl overflow-hidden relative bg-cover h-auto bg-no-repeat w-full bg-center;
}

.promo-bg::before {
  content: '';
  background: conic-gradient(from -90deg at 50% 50%, #2453f3 0deg, #fff 360deg);
  width: 1000px;
  height: 1000px;
  border-radius: 50%;
  position: absolute;
  left: -20px;
  transform-origin: right;
  margin: 0;
  top: 100%;
  transform: translateY(-50%);
  @apply absolute bg-cover origin-center transition-all duration-500 ease-out -left-80 md:-left-5;
}

.promo-bg::after {
  content: '';
  background: conic-gradient(from -90deg at 50% 50%, #2453f3 0deg, #fff 360deg);
  width: 700px;
  height: 700px;
  border-radius: 50%;
  right: -20px;
  margin: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  @apply absolute bg-cover origin-center transition-all duration-500 ease-out opacity-0 lg:opacity-100;
}

.promo-bg:hover::after {
  transform: translateY(-50%) rotate(90deg);
}

.promo-btn {
  @apply text-blue-600 hover:text-white text-sm border border-blue-600 hover:border-white p-2 rounded-lg  bg-white/70  hover:bg-black/20 focus:bg-black/20 transition-all inline-block cursor-pointer;

  font-variation-settings: 'wght' 600;
}

.promo-bg:hover .promo-btn {
  @apply bg-white;
}

.promo-bg:hover .promo-btn:hover {
  @apply bg-black/20;
}
</style>
