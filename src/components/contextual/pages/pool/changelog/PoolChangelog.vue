<script setup lang="ts">
import { Pool, PoolAmpUpdate } from '@/services/pool/types';
import ChangelogAccordion from './ChangelogAccordion.vue';
import { useI18n } from 'vue-i18n';
import AmpUpdate from './AmpUpdate.vue';
import PoolCreationChangelog from './PoolCreationChangelog.vue';
import { shortenLabel } from '@/lib/utils';
import { ref } from 'vue';

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

const openedAccordions = ref<number[]>([]);
function toggle(index: number) {
  openedAccordions.value.includes(index)
    ? openedAccordions.value.splice(openedAccordions.value.indexOf(index), 1)
    : openedAccordions.value.push(index);
}
</script>
    
<template>
  <div>
    <h4 class="px-4 lg:px-0 mb-4" v-text="$t('managementHistory')" />

    <div class="changelog">
      <div class="changelog__timeline">
        <div v-for="(item, index) in changelogData" :key="item.title">
          <ChangelogAccordion
            :isOpen="openedAccordions.includes(index)"
            @toggle="toggle(index)"
          >
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
                  :class="{ 'header-active': openedAccordions.includes(index) }"
                >
                  <div>
                    <div class="header-title">{{ item.title }}</div>
                    <div
                      class="header-subtitle"
                      :class="{ active: openedAccordions.includes(index) }"
                    >
                      {{ item.subTitle }}
                    </div>
                  </div>
                  <img
                    class="chevron"
                    :class="{ 'chevron-up': openedAccordions.includes(index) }"
                    src="@/assets/images/icons/chevron-down.svg"
                  />
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
  </div>
</template>
    
<style scoped>
.changelog {
  @apply relative px-5 sm:px-0;
}

.changelog__timeline-icon {
  @apply mr-3;
}

.changelog__timeline-header {
  transition: all 0.3s ease;
  @apply py-3 flex justify-between flex-1 border-solid border-t-2 border-gray-200 px-5 sm:h-20 py-0;
}

.changelog__timeline-header.header-active {
  border-color: theme('colors.blue.600');

  @apply border-blue-600 border-solid border-b-2;
}

.header-title {
  @apply text-base font-bold;
}

.header-subtitle {
  will-change: font-size;
  transition: all 0.3s ease;
  @apply text-sm text-gray-600;
}

.header-subtitle.active {
  @apply text-lg text-black font-bold;
}

.changelog__timeline-content {
  @apply py-3 px-12 sm:py-6;
}

.changelog__timeline::before {
  content: '';
  @apply absolute block h-full bg-gray-100 w-1 rounded top-0 left-10 sm:left-4;
}

.chevron {
  width: 14px;
  transform: translateX(6px) rotate(0deg);
  will-change: transform;
  transition: all 0.3s ease;
  color: theme('colors.blue.600');
}

.chevron-up {
  transform: translateX(6px) rotate(180deg);
  color: theme('colors.pink.500');
}
</style>
    