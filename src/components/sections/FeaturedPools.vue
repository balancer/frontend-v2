<template>
  <div>
    <h3 class="mb-4">{{ $t('featuredProtocol') }}</h3>
    <div class="grid grid-cols-12 gap-x-4">
      <div class="mb-4 col-span-12 lg:col-span-6">
        <BalCard
          title="Element Finance"
          imgSrc="/images/banners/element.png"
          hFull
          growContent
        >
          <p>
            {{ $t('aboutElementFinance') }}
          </p>
          <template v-slot:footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
              <span>{{ $t('viewAndManangeOnElement') }}</span>
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="mb-4 col-span-12 md:col-span-6 md:col-span-6 lg:col-span-3">
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
              <span>{{ $t('viewOnElement') }}</span>
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
              <span>{{ $t('viewOnElement') }}</span>
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
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return {
      EXTERNAL_LINKS,
      t
    };
  }
});
</script>
