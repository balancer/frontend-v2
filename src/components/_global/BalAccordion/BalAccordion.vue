<script setup lang="ts">
import anime from 'animejs';
import { takeRight } from 'lodash';
import { ComponentPublicInstance, nextTick, onMounted, ref, watch } from 'vue';

type Section = {
  title: string;
  id: string;
  // custom renderer slot id for handle
  handle?: string;
  // prevent this accordion section from
  // being expanded
  isDisabled?: boolean;
};

type Props = {
  sections: Section[];
  // changing variables which can be used to
  // determine whether to re-render the height
  // of an accordion section

  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  dependencies?: unknown;
  showSectionBorder?: boolean;
  reCalcKey?: number;
};

const props = withDefaults(defineProps<Props>(), {
  showSectionBorder: true,
  reCalcKey: 0,
});

const activeSection = ref('');
const activeSectionElement = ref<HTMLElement>();
const accordionHeightSetterElement = ref<HTMLElement>();
const wrapperElement = ref<HTMLElement>();
const handleBarElement = ref<HTMLElement>();
const arrowElement = ref<HTMLElement>();
const handleBarElements = ref<(Element | ComponentPublicInstance)[]>([]);

const minimisedWrapperHeight = ref(0);
const isContentVisible = ref(false);
const height = ref();
const handleBarHeight = ref(0);
const totalHeight = ref(0);

const easing = 'spring(0.2, 150, 18, 0)';

async function toggleSection(section: string, collapse = true) {
  const _section = props.sections.find(s => (s.id = section));
  if (_section?.isDisabled) return;

  const collapseCurrentSection = activeSection.value === section && collapse;

  if (collapseCurrentSection) {
    activeSection.value = '';
    isContentVisible.value = false;
  } else {
    activeSection.value = section;
    isContentVisible.value = true;
  }
  await nextTick();

  if (activeSectionElement.value && accordionHeightSetterElement.value) {
    height.value = activeSectionElement.value.clientHeight;
    isContentVisible.value = false;
  }

  handleBarElements.value.forEach(handleBar => {
    anime({
      targets: handleBar,
      translateY: `0px`,
      easing,
    });
  });

  const activeSectionIndex = props.sections.findIndex(
    s => s.id === activeSection.value
  );
  const handleBarsToTransform = takeRight(
    handleBarElements.value,
    handleBarElements.value.length - (activeSectionIndex + 1)
  );

  // unfortunately this does introduce reflow (animating height of total)
  // but it way better than having to animate the height of 2 sections
  // the one minimising + the one maximising
  const heightToAnimate = collapseCurrentSection
    ? minimisedWrapperHeight.value
    : minimisedWrapperHeight.value + height.value;
  await nextTick();
  anime({
    targets: wrapperElement.value,
    height: `${heightToAnimate}px`,
    easing,
  });

  handleBarsToTransform.forEach(handleBar => {
    const y = collapseCurrentSection ? 0 : height.value;
    anime({
      targets: handleBar,
      translateY: `${y}px`,
      easing,
    });
  });

  // animate the arrow
  anime({
    targets: arrowElement.value,
    rotate: '90deg',
  });

  setTimeout(async () => {
    isContentVisible.value = true;
    await nextTick();
    if (activeSectionElement.value) {
      anime.set(activeSectionElement.value, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        opacity: 0,
      });
      anime({
        targets: activeSectionElement.value,
        opacity: 1,
      });
    }
  }, 300);
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
});

function setHandleBars(el: Element | ComponentPublicInstance | null) {
  if (!el) return;
  if (!handleBarElements.value?.includes(el)) {
    handleBarElements.value.push(el);
  }
}

/**
 * WATCHERS
 */
watch(
  () => props.dependencies,
  () => {
    toggleSection(activeSection.value, false);
  }
);

watch(
  () => props.reCalcKey,
  newVal => {
    if (newVal && activeSection.value) {
      toggleSection(activeSection.value, false);
    }
  }
);
</script>

<template>
  <div ref="wrapperElement">
    <BalCard hFull noPad shadow="none" class="overflow-visible rounded-xl">
      <div
        v-for="(section, i) in sections"
        :key="section.id"
        :ref="setHandleBars"
        class="flex flex-col"
      >
        <div
          v-if="section.handle"
          ref="handleBarElement"
          @click="toggleSection(section.id)"
        >
          <slot :name="section.handle" />
        </div>
        <button
          v-else
          ref="handleBarElement"
          :class="[
            'w-full flex justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800',
            {
              'border-b dark:border-gray-900': i !== sections.length - 1,
            },
          ]"
          @click="toggleSection(section.id)"
        >
          <h6>{{ section.title }}</h6>
          <BalIcon class="text-blue-400" name="chevron-down" />
        </button>
        <div
          v-if="activeSection === section.id"
          ref="accordionHeightSetterElement"
          class="relative"
        >
          <!-- content -->
          <div
            v-if="isContentVisible"
            ref="activeSectionElement"
            :class="{
              'border-b active-section rounded-b':
                isContentVisible && showSectionBorder,
            }"
          >
            <slot :name="section.id" />
          </div>
        </div>
      </div>
    </BalCard>
  </div>
</template>
