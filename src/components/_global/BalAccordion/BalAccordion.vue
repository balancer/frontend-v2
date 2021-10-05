<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import anime from 'animejs';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import { findIndex, takeRight } from 'lodash';

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
const wrapperElement = ref<HTMLElement>();
const handleBarElement = ref<HTMLElement>();
const handleBarElements = ref<HTMLElement[]>([]);

const minimisedWrapperHeight = ref(0);
const isContentVisible = ref(false);
const height = ref();
const handleBarHeight = ref(0);
const totalHeight = ref(0);

async function toggleSection(section: string) {
  activeSection.value = section;
  isContentVisible.value = true;
  await nextTick();
  if (activeSectionElement.value && accordionHeightSetterElement.value) {
    height.value = activeSectionElement.value.clientHeight;
    isContentVisible.value = false;
  }


  const activeSectionIndex = props.sections.findIndex(s => s.id === activeSection.value);
  const handleBarsToTransform = takeRight(handleBarElements.value, handleBarElements.value.length - (activeSectionIndex + 1))

  handleBarsToTransform.forEach((handleBar, i) => {
    anime({
      targets: handleBar,
      translateY: `${height.value}px`
    })
  })

  console.log('bars', handleBarsToTransform)
}

// all of this happens without the user seeing any feedback
onMounted(async () => {
  // set to true so we can actually measure the content height
  isContentVisible.value = true;

  // set the height of the minimised accordion
  minimisedWrapperHeight.value = wrapperElement.value?.offsetHeight || 0;

  handleBarHeight.value = handleBarElement.value?.offsetHeight || 0;

  // the total expanded height starts with tracking the minimised height first
  totalHeight.value = wrapperElement.value?.offsetHeight || 0;

  // calculating the height of the completely expanded accordion
  // by summing the heights of each section onto the minimised
  // height of the accordion
  for (const section of props.sections) {
    activeSection.value = section.id;
    await nextTick();
    totalHeight.value =
      totalHeight.value + (activeSectionElement.value?.offsetHeight || 0);
  }

  // need to set this back to false so its like the accordion
  // was never active
  activeSection.value = '';
  isContentVisible.value = false;

  if (wrapperElement.value) {
    anime.set(wrapperElement.value, {
      height: totalHeight.value
    });
  }
});

function setHandleBars(el: HTMLElement) {
  if (!handleBarElements.value?.includes(el)) {
    handleBarElements.value.push(el);
  }
}
</script>

<template>
  <div ref="wrapperElement">
    <BalCard hFull no-pad>
      <div
        class="flex flex-col"
        v-for="section in sections"
        :key="section.id"
        :ref="setHandleBars"
      >
        <button
          ref="handleBarElement"
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
          <div ref="activeSectionElement" v-if="isContentVisible">
            <slot :name="section.id" />
          </div>

        </div>
      </div>
    </BalCard>
  </div>
</template>
