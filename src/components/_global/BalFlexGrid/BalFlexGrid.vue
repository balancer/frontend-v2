<script lang="ts">
import { computed, defineComponent, h, VNodeArrayChildren } from 'vue';

export default defineComponent({
  name: 'BalFlexGrid',

  props: {
    gap: { type: Number, default: 4 },
    flexWrap: { type: Boolean, default: false },
  },

  setup(props, { slots }) {
    const spacing = computed((): string => (props.gap / 2).toString());

    const flexClasses = computed(() => ({
      'flex-wrap': props.flexWrap,
    }));

    // @ts-ignore
    const slotChildren = slots.default()[0].children as VNodeArrayChildren;
    const gridItems = slotChildren.map(slotItem =>
      h('div', { class: `px-${spacing.value} mb-${spacing.value}` }, [slotItem])
    );

    return () =>
      h('div', { class: `px-${spacing.value}` }, [
        h(
          'div',
          { class: [`flex -mx-${props.gap}`, flexClasses.value] },
          gridItems
        ),
      ]);
  },
});
</script>
