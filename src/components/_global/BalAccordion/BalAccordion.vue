<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import anime from 'animejs';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';

type Section = {
  title: string;
  id: string;
};

type Props = {
  sections: Section[];
};

const props = defineProps<Props>();

const activeSection = ref('');
const activeSectionElement = ref<HTMLElement>();
const accordionHeightSetterElement = ref<HTMLElement>();
const isContentVisible = ref(false);
const height = ref();

async function toggleSection(section: string) {
  activeSection.value = section;
  isContentVisible.value = true;
  await nextTick();
  if (activeSectionElement.value && accordionHeightSetterElement.value) {
    height.value = activeSectionElement.value.clientHeight;
    isContentVisible.value = false;
    await nextTick();
    anime.set(accordionHeightSetterElement.value, {
      maxHeight: '0px',
      opacity: 0
    });

    isContentVisible.value = true;
    anime({
      targets: accordionHeightSetterElement.value,
      maxHeight: `${height.value}px`,
      easing: 'spring(.25, 100, 18, 0)',
      opacity: 1
    });
  }
}
</script>

<template>
  <div ref="wrapperElement">
    <BalCard no-pad>
      <div class="flex flex-col" v-for="section in sections" :key="section.id">
        <button
          @click="toggleSection(section.id)"
          class="w-full flex justify-between p-3"
        >
          <h6>{{ section.title }}</h6>
          <BalIcon class="text-blue-400" name="chevron-down" />
        </button>
        <div
          class="relative"
          ref="accordionHeightSetterElement"
          v-if="activeSection === section.id"
        >
          <!-- content -->
          <div ref="activeSectionElement">
            <slot :name="section.id" />
          </div>
        </div>
      </div>
    </BalCard>
  </div>
</template>
