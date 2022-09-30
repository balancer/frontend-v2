<script setup lang="ts">
import { computed } from 'vue';
import { Pool } from '@/services/pool/types';
import ChangelogAccordion from './ChangelogAccordion.vue';
import usePoolAmpUpdatesQuery from '@/composables/queries/usePoolAmpUpdatesQuery';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

const ampUpdatesQuery = usePoolAmpUpdatesQuery(props.pool.id);

const ampUpdates = computed(() => ampUpdatesQuery.data.value);
ampUpdates;
const changelogData = [
  {
    title: 'Pool creation',
    subTitle: '',
    icon: 'swap-fee',
    active: true,
  },
];
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
                <h3>{{ item.title }}</h3>
              </div>
            </div>
          </template>
          <!-- This slot will handle all the content that is passed to the accordion -->
          <template #accordion-content>
            <div class="changelog__timeline-content">
              <span>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </span>
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
  border-top: 2px solid theme('colors.gray.200');
  border-bottom: 2px solid theme('colors.gray.200');
  flex: 1;
}

.changelog__timeline-header.header-active {
  border-color: theme('colors.blue.600');
}

.changelog__timeline-content {
  /* position: relative; */
  padding: 20px 25px;
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
    