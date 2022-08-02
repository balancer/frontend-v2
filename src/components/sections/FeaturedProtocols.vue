<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return {
      EXTERNAL_LINKS,
      t,
    };
  },
});
</script>

<template>
  <div class="featured-protocols">
    <h3 class="mb-4">
      {{ $t('featuredProtocols.title') }}
    </h3>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Element Finance"
          imgSrc="/images/banners/element.jpg"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <p>
            {{ $t('featuredProtocols.Element') }}
          </p>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Copper Launch"
          imgSrc="/images/banners/copper.png"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <p>{{ $t('featuredProtocols.Copper') }}</p>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Copper.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Tracer DAO"
          imgSrc="/images/banners/tracer.jpg"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <div>
            <p>{{ $t('featuredProtocols.Tracer') }}</p>
          </div>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Tracer.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 xs:col-span-6 lg:col-span-3">
        <BalCard
          title="Sense Finance"
          imgSrc="/images/banners/sense.png"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <div>
            <p>{{ $t('featuredProtocols.Sense') }}</p>
          </div>
          <template #footer>
            <BalLink :href="EXTERNAL_LINKS.Sense.Home" external>
              <span>{{ $t('learnMore') }}</span>
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="relative top-0.5 ml-0.5"
              />
            </BalLink>
          </template>
        </BalCard>
      </div>
    </div>
  </div>
</template>
<style scoped>
:deep(.card-container) {
  justify-content: space-between;
  height: 100%;
}

.featured-protocols :deep(.feature) {
  height: 8rem;
}
</style>
