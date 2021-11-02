<template>
  <div class="pr-2">
    <div class="flex justify-between text-sm text-gray-500">
      <div>
        <slot v-if="$slots.leftLabel || leftLabel" name="leftLabel">
          {{ leftLabel }}
        </slot>
      </div>
      <div>
        <slot v-if="$slots.rightLabel || rightLabel" name="rightLabel">
          {{ rightLabel }}
        </slot>
      </div>
    </div>
    <vue-slider
      v-model="range"
      v-bind="$attrs"
      @change="onChange"
      :dot-style="dotStyle"
      :rail-style="railSyle"
      :process-style="proccessStyle"
    />
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';
import { theme } from '@/../tailwind.config';
import useDarkMode from '@/composables/useDarkMode';

export default defineComponent({
  name: 'BalRangeInput',

  components: {
    VueSlider
  },

  emits: ['change', 'update:modelValue'],

  props: {
    modelValue: { type: [String, Number], default: '0' },
    leftLabel: { type: String, default: '' },
    rightLabel: { type: String, default: '' }
  },

  setup(props, { emit }) {
    const range = ref(0);
    const { darkMode } = useDarkMode();

    const colors = theme.extend.colors;

    function onChange(value) {
      emit('change', value);
      emit('update:modelValue', value);
    }

    const dotStyle = computed(() => {
      return {
        backgroundColor: colors.blue['500'],
        borderColor: colors.blue['500'],
        borderWidth: 0,
        backgroundImage: `linear-gradient(to top right, ${colors.blue['500']}, ${colors.pink['500']})`
      };
    });

    const railSyle = computed(() => {
      return {
        background: darkMode.value ? colors.gray['900'] : colors.gray['100']
      };
    });

    const proccessStyle = computed(() => {
      return {
        backgroundImage: `linear-gradient(to top right, ${colors.blue['500']}, ${colors.pink['500']})`
      };
    });

    watch(
      () => props.modelValue,
      newVal => {
        range.value = Number(newVal) || 0;
      },
      { immediate: true }
    );

    return {
      range,
      onChange,
      dotStyle,
      railSyle,
      proccessStyle
    };
  }
});
</script>

<style>
.vue-slider-dot-handle-focus {
  box-shadow: 0 0 0 5px rgb(0, 0, 0, 0.2);
}
</style>
