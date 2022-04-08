<script setup lang="ts">
import HomeDiscoverInvestmentPool from '@/beethovenx/components/pages/home/HomeDiscoverInvestmentPool.vue';
import HomeNewsItems from '@/beethovenx/components/pages/home/HomeNewsItems.vue';
import HomeEducationItems from '@/beethovenx/components/pages/home/HomeEducationItems.vue';
</script>

<template>
  <div>
    <div
      class="hero-container lg:container lg:mx-auto pt-10 sm:pt-16 lg:pt-8 overflow-hidden"
    >
      <div class="mx-auto max-w-7xl">
        <div class="lg:grid lg:grid-cols-2 lg:gap-8">
          <div
            class="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center pb-8 lg:pb-0"
          >
            <div class="lg:pb-12">
              <h1 class="hero-h1">
                <span class="block">Your spiritually</span>
                <span class="block">SYMPHONIC</span>
                <span class="block">Decentralized</span>
                <span class="block">Investment Platform</span>
              </h1>
              <img src="~@/beethovenx/assets/images/title-text.svg" />
              <p
                class="mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl pl-4 text-left font-book"
              >
                Built on Balancer V2, Beethoven X is the first next-generation
                AMM protocol on Fantom Opera.
              </p>
              <div class="sm:hidden pt-8">
                <router-link
                  :to="{ name: 'trade' }"
                  class="beet-button green-button mx-auto"
                >
                  Swap
                </router-link>
                <router-link
                  :to="{ name: 'pools' }"
                  class="beet-button blue-button mx-auto mt-4"
                >
                  Invest
                </router-link>
              </div>
              <div class="pt-8 hidden sm:flex sm:pt-12">
                <router-link
                  :to="{ name: 'trade' }"
                  class="beet-button green-button-small mx-auto sm:mx-0"
                >
                  Swap
                </router-link>
                <router-link
                  :to="{ name: 'pools' }"
                  class="beet-button blue-button-small mx-auto mt-4 sm:ml-4 sm:mt-0 sm:mr-0"
                >
                  Invest
                </router-link>
              </div>
            </div>
          </div>
          <div
            class="sm:mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative hidden lg:flex"
          >
            <div class="flex-1 hidden lg:block" />
            <div
              class="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0 items-right flex justify-end"
            >
              <img
                src="~@/beethovenx/assets/images/hero-image.png"
                width="453"
                height="590"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-12">
      <div class="flex items-center">
        <div class="flex-1">
          <img
            src="~@/beethovenx/assets/images/discover-investment-pool.svg"
            class="mb-8 -ml-4"
          />
        </div>
        <router-link
          :to="{ name: 'pools' }"
          class="text-lg underline text-green-500 hidden sm:inline-block"
        >
          Browse All
        </router-link>
      </div>
      <HomeDiscoverInvestmentPool />
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/why-is-beets-awesome.svg"
        class="mb-8 -ml-4"
      />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="flex flex-col items-center">
          <img
            src="~@/beethovenx/assets/images/yield-generating-image.png"
            class="w-2/3 mb-2"
          />
          <img
            src="~@/beethovenx/assets/images/for-investors.svg"
            class="mb-3"
          />
          <div class="text-center text-lg px-8">
            Create a unique crypto index fund tailored to your desired asset
            allocations. Collect fees from traders who rebalance your funds by
            following arbitrage opportunities.
          </div>
        </div>
        <div class="flex flex-col items-center">
          <img
            src="~@/beethovenx/assets/images/looking-image.png"
            class="w-2/3 mb-2"
          />
          <img src="~@/beethovenx/assets/images/for-traders.svg" class="mb-3" />
          <div class="text-center text-lg px-8">
            Balancer V2 enables efficient trading by pooling crowdsourced
            liquidity from investor portfolios and using its unique Smart Order
            Router to find traders the best available price.
          </div>
        </div>
        <div class="flex flex-col items-center">
          <img
            src="~@/beethovenx/assets/images/speed-image.png"
            class="w-2/3 mb-2"
          />
          <img
            src="~@/beethovenx/assets/images/for-protocols.svg"
            class="mb-3"
          />
          <div class="text-center text-lg px-8">
            Launch your token in the fairest way possible, using an LGE. Use an
            80/20 BPT instead of single staking to capture market volatility
            with minimal impermanent loss.
          </div>
        </div>
      </div>
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/latest-updates.svg"
        class="mb-8 -ml-4"
      />
      <HomeNewsItems />
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/learning-the-notes.svg"
        class="mb-8 -ml-4"
      />
      <HomeEducationItems />
    </div>
    <!--    <div class="lg:container lg:mx-auto pt-10 md:pt-20">
      <img
        src="~@/beethovenx/assets/images/our-partners.svg"
        class="mb-8 -ml-4"
      />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
    </div>-->
  </div>
</template>

<style scoped>
h1.hero-h1 {
  display: none;
}

.hero-container {
  background: url('../assets/images/hero-shadow.png') bottom left repeat-x;
}

.beet-button {
  @apply font-bold font-body text-lg;
  align-items: center;
  justify-content: center;
  display: flex;
}

.green-button {
  @apply text-gray-800;
  background: url('../assets/images/green-button.svg') center center;
  width: 290px;
  height: 80px;
}

.green-button-small {
  @apply text-gray-800;
  background: url('../assets/images/green-button-small.svg') center center;
  width: 212px;
  height: 80px;
}

.blue-button-small {
  background: url('../assets/images/blue-button-small.svg') center center;
  width: 212px;
  height: 80px;
}

.blue-button {
  background: url('../assets/images/blue-button.svg') center center;
  width: 290px;
  height: 80px;
}
</style>
