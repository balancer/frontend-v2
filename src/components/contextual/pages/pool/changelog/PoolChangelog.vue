<script setup lang="ts">
// import { computed } from 'vue';
import { Pool, PoolAmpUpdate } from '@/services/pool/types';
import ChangelogAccordion from './ChangelogAccordion.vue';
import { useI18n } from 'vue-i18n';
import AmpUpdate from './AmpUpdate.vue';
import PoolCreationChangelog from './PoolCreationChangelog.vue';
import { shortenLabel } from '@/lib/utils';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  ampUpdates: PoolAmpUpdate[];
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();

/**
 * STATE
 */
const changelogData: any = [
  ...props.ampUpdates.map(ampUpdate => ({
    title: t('ampFactor.update'),
    subTitle: `${t('ampFactor.range', [ampUpdate.startAmp, ampUpdate.endAmp])}`,
    icon: 'amp',
    active: true,
    isAmpUpdate: true,
    data: ampUpdate,
  })),
  {
    title: `${props.pool.poolType} Pool by ${shortenLabel(props.pool.owner)}`,
    subTitle: t('changelog.poolCreation.subTitle'),
    icon: 'swap-fee',
    active: true,
    isPoolCreation: true,
    data: '',
  },
];

// const ampUpdatedData = computed(() => {
//   console.log(props.ampUpdates);
//   return props.ampUpdates;
// });
</script>
    
<template>
  <div class="changelog">
    <div class="changelog__timeline">
      <div v-for="item in changelogData" :key="item.title">
        <ChangelogAccordion>
          <!-- This slot will handle the title/header of the accordion and is the part you click on -->
          <template #accordion-trigger>
            <div class="flex">
              <div class="flex items-center">
                <img
                  class="changelog__timeline-icon"
                  :src="require(`@/assets/images/icons/${item.icon}.svg`)"
                />
              </div>
              <div
                class="changelog__timeline-header"
                :class="{ 'header-active': false }"
              >
                <div class="header-title">{{ item.title }}</div>
                <div class="header-subtitle">{{ item.subTitle }}</div>
              </div>
            </div>
          </template>
          <!-- This slot will handle all the content that is passed to the accordion -->
          <template #accordion-content>
            <div class="changelog__timeline-content">
              <AmpUpdate v-if="item.isAmpUpdate" :ampUpdate="item.data" />
              <PoolCreationChangelog
                v-if="item.isPoolCreation"
                :poolCreation="item.data"
                :pool="pool"
              />
            </div>
          </template>
        </ChangelogAccordion>
      </div>
    </div>
  </div>
</template>
    
<style scoped>
.changelog {
  /* border-left: 2px solid #f3f4f6;
  border-radius: 20px; */
  position: relative;
}

.changelog__timeline-icon {
  @apply mr-3;
}

.changelog__timeline-header {
  padding: 20px 25px;

  flex: 1;
  @apply py-3 flex-1 border-solid border-t-2 border-gray-200 px-5 sm:py-6;
}

.header-title {
  @apply text-base font-bold;
}

.header-subtitle {
  @apply text-sm text-gray-600;
}

.changelog__timeline-header.header-active {
  border-color: theme('colors.blue.600');
}

.changelog__timeline-content {
  @apply py-3 px-5 sm:py-6;
}

.changelog__timeline::before {
  content: ' ';
  position: absolute;
  display: block;
  width: 2px;
  top: 0;
  left: 0;
  background-color: #f3f4f6;
  height: auto;
}
</style>
    