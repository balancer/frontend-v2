<template>
  <div class="p-4">
    <h3 class="mb-4">Featured ecosystem protocol</h3>
    <div class="grid grid-cols-12 gap-x-4">
      <div class="mb-4 col-span-12 lg:col-span-6">
        <BalFeatureCard
          imgSrc="/images/banners/element.png"
        >
          <h4 class="mb-2">Element Finance</h4>
          <p class="mb-4">
            Element is an open source protocol for fixed and variable yield
            markets. It is built on Balancer V2. View and manage your liquidity
            positions directly on Element.fi.
          </p>
          <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
            <span>View and manage all pools on Element.fi 🡥</span>
          </BalLink>
        </BalFeatureCard>
      </div>
      <div class="mb-4 col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
        <BalFeatureCard
          imgSrc="/images/banners/element-lusd.png"
        >
          <div class="flex flex-col justify-between flex-grow">
            <div class="">
              <h4 class="mb-1">LUSD</h4>
              <h6>LUSD3CRV-f—ePyvCurveLUSD</h6>
              <p class="mb-4">
                Element principal pool Yearn crvLUSD v2 vault.
              </p>
            </div>
            <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
              <span>View on Element.fi 🡥</span>
            </BalLink>
          </div>
        </BalFeatureCard>
      </div>
      <div class="mb-4 col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
        <BalFeatureCard
          imgSrc="/images/banners/element-usdc.png"
        >
          <h4 class="mb-1">USDC</h4>
          <h6>USDC—ePyvUSDC</h6>
          <p class="mb-4">
            Element principal pool Yearn USDC v2 vault.
          </p>
          <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
            <span>View on Element.fi 🡥</span>
          </BalLink>
        </BalFeatureCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { EXTERNAL_LINKS } from '@/constants/links';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {
      EXTERNAL_LINKS
    };
  }
});
</script>
