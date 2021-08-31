<template>
  <div>
    <h3 class="mb-4">Featured ecosystem protocol</h3>
    <div class="grid grid-cols-12 gap-x-4">
      <div class="mb-4 col-span-12 lg:col-span-6">
        <BalCard
          title="Element Finance"
          imgSrc="/images/banners/element.png"
          hFull
          growContent
        >
          <p>
            Element is an open source protocol for fixed and variable yield
            markets. It is built on Balancer V2. View and manage your liquidity
            positions directly on Element.fi.
          </p>
          <template v-slot:footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
              <span>View and manage all pools on Element.fi 🡥</span>
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div
        class="mb-4 col-span-12 md:col-span-6 md:col-span-6 lg:col-span-3"
      >
        <BalCard
          title="LUSD"
          imgSrc="/images/banners/element-lusd.png"
          hFull
          growContent
        >
          <h6>LUSD3CRV-f—ePyvCurveLUSD</h6>
          <p>
            Element principal pool Yearn crvLUSD v2 vault.
          </p>
          <template v-slot:footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
              <span>View on Element.fi 🡥</span>
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="mb-4 col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
        <BalCard
          title="USDC"
          imgSrc="/images/banners/element-usdc.png"
          hFull
          growContent
        >
          <h6>USDC—ePyvUSDC</h6>
          <p>
            Element principal pool Yearn USDC v2 vault.
          </p>
          <template v-slot:footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
              <span>View on Element.fi 🡥</span>
            </BalLink>
          </template>
        </BalCard>
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
