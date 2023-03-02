<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';

const { t } = useI18n();

const featuredProtocols = [
  {
    title: 'Element Finance',
    description: t('featuredProtocols.Element.description'),
    linkText: t('featuredProtocols.Element.linkText'),
    imgSrc: '/images/banners/element.jpg',
    link: EXTERNAL_LINKS.Element.Home,
  },
  {
    title: 'Fjord Foundry',
    description: t('featuredProtocols.Copper.description'),
    linkText: t('featuredProtocols.Copper.linkText'),
    imgSrc: '/images/banners/fjord.png',
    link: EXTERNAL_LINKS.Copper.Home,
  },
  {
    title: 'Mycelium',
    description: t('featuredProtocols.Tracer.description'),
    linkText: t('featuredProtocols.Tracer.linkText'),
    imgSrc: '/images/banners/mycelium.jpg',
    link: EXTERNAL_LINKS.Tracer.Home,
  },
  {
    title: 'Sense Finance',
    description: t('featuredProtocols.Sense.description'),
    linkText: t('featuredProtocols.Sense.linkText'),
    imgSrc: '/images/banners/sense.png',
    link: EXTERNAL_LINKS.Sense.Home,
  },
];
</script>

<template>
  <div v-once class="featured-protocols">
    <h3 class="mb-4">
      {{ $t('featuredProtocols.title') }}
    </h3>
    <div class="grid grid-cols-12 gap-4">
      <div
        v-for="{
          title,
          imgSrc,
          description,
          linkText,
          link,
        } in featuredProtocols"
        :key="title"
        class="col-span-12 xs:col-span-6 lg:col-span-3"
      >
        <BalCard
          :title="title"
          :imgSrc="imgSrc"
          class="hover:shadow-xl transition-shadow"
          hFull
          growContent
        >
          <p>
            {{ description }}
          </p>
          <template #footer>
            <BalLink :href="link" external>
              <span>{{ linkText }}</span>
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
