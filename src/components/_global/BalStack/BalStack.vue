<script lang="ts">
import { defineComponent, PropType, h } from 'vue';

type Spacing = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'none';
type Alignment = 'center' | 'start' | 'end' | 'between';

const SpacingMap: Record<Spacing, number> = {
  xs: 1,
  sm: 2,
  base: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  none: 0
};

export default defineComponent({
  props: {
    vertical: { type: Boolean, default: () => false },
    horizontal: { type: Boolean, default: () => false },
    spacing: {
      type: String as PropType<Spacing>,
      default: () => 'base'
    },
    withBorder: {
      type: Boolean,
      default: () => false
    },
    align: {
      type: String as PropType<Alignment>
    },
    justify: {
      type: String as PropType<Alignment>
    },
    isDynamic: {
      type: Boolean,
      default: () => false
    },
    expandChildren: {
      type: Boolean,
      default: () => false
    }
  },
  setup(props, { slots, attrs }) {
    return {
      slotsWithContent: [],
      slots,
      attrs
    };
  },
  render() {
    const spacingType = this.vertical ? 'mb' : 'mr';
    const spacingClass = `${spacingType}-${SpacingMap[this.spacing]}`;

    const vNodes = this.$slots.default() || [];
    const children = vNodes.filter(vNode => vNode.children !== 'v-if');
    const styledChildren = children.map((child, childIndex) => {
      let styledNestedChildren = child.children;
      if (Array.isArray(styledNestedChildren)) {
        const nonNullishChildren = styledNestedChildren.filter(
          nestedChild => nestedChild !== undefined || nestedChild !== null
        );
        styledNestedChildren = nonNullishChildren.map(
          (nestedChild, nestedChildIndex) => {
            return h(nestedChild, {
              class:
                nestedChildIndex !== nonNullishChildren.length - 1
                  ? spacingClass
                  : null
            });
          }
        );
        return h(
          child,
          {
            class: childIndex !== children.length - 1 ? spacingClass : null
          },
          [styledNestedChildren]
        );
      }
      return h(child, {
        class: childIndex !== children.length - 1 ? spacingClass : null
      });
    });
    return h(
      'div',
      {
        attrs: this.$attrs,
        class: [
          'flex',
          {
            'flex-row': this.horizontal,
            'flex-col': this.vertical,
            'items-center': this.align === 'center',
            'items-start': this.align === 'start',
            'items-end': this.align === 'end',
            'items-between': this.align === 'between',
            'justify-center': this.justify === 'center',
            'justify-start': this.justify === 'start',
            'justify-end': this.justify === 'end',
            'justify-between': this.justify === 'between'
          }
        ]
      },
      [styledChildren]
    );
  }
});
</script>
