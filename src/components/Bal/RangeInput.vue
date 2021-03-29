<template>
  <div>
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
      :contained="true"
    />
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';
import { theme } from '@/../tailwind.config';

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

    const colors = theme.extend.colors;

    function onChange(value) {
      emit('change', value);
      emit('update:modelValue', value);
    }

    const dotStyle = computed(() => {
      return {
        background: colors.gray['50'],
        outlineColor: colors.gray['900'],
        borderColor: colors.gray['900']
      };
    });

    const railSyle = computed(() => {
      return {
        background: colors.gray['100']
      };
    });

    const proccessStyle = computed(() => {
      return {
        background: colors.gray['900']
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
