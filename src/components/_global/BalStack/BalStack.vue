<script lang="ts">
import { defineComponent, h, PropType } from 'vue';

type Spacing = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'none';
type Alignment = 'center' | 'start' | 'end' | 'between';

/**
 * Maps discrete spacing types to a tailwind spacing tier
 */
const SpacingMap: Record<Spacing, number> = {
  xs: 1,
  sm: 2,
  base: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  none: 0,
};

export default defineComponent({
  props: {
    /**
     * Stacked top down
     */
    vertical: { type: Boolean, default: () => false },
    /**
     * Stacked left to right
     */
    horizontal: { type: Boolean, default: () => false },
    spacing: {
      type: String as PropType<Spacing>,
      default: () => 'base',
    },
    /**
     * Show a hairline border after each stack element
     */
    withBorder: {
      type: Boolean,
      default: () => false,
    },
    /**
     * Flex align prop
     */
    align: {
      type: String as PropType<Alignment>,
      default: null,
    },
    /**
     * Flex justify prop
     */
    justify: {
      type: String as PropType<Alignment>,
      default: null,
    },
    /**
     * Will cause children of the stack to occupy
     * as much space as possible.
     */
    expandChildren: {
      type: Boolean,
      default: () => false,
    },
  },
  setup(props, { slots, attrs }) {
    return {
      slotsWithContent: [],
      slots,
      attrs,
    };
  },
  render() {
    const spacingType = this.vertical ? 'mb' : 'mr';
    const borderType = this.vertical ? 'b' : 'r';
    const widthClass = this.expandChildren ? 'w-full' : '';
    const borderClass = this.withBorder ? `border-${borderType}` : '';
    const stackNodeClass = `dark:border-gray-600 ${spacingType}-${
      SpacingMap[this.spacing]
    } ${borderClass} ${widthClass}`;

    // @ts-ignore
    const vNodes = this.$slots.default() || [];
    // if a childs 'value' is 'v-if', it is not visible so filter it out
    // to not cause an empty node to render with margin
    const children = vNodes.filter(vNode => vNode.children !== 'v-if');
    // need to apply margin and decorator classes to all children
    const styledChildren = children.map((child, childIndex) => {
      let styledNestedChildren = child.children;
      // a child can have an array of nested children, this is when
      // those children are rendered as part of a 'v-for directive'
      if (Array.isArray(styledNestedChildren)) {
        // and those children can be nullish too
        const nonNullishChildren = styledNestedChildren.filter(
          nestedChild => nestedChild !== undefined || nestedChild !== null
        );
        styledNestedChildren = nonNullishChildren.map(
          (nestedChild, nestedChildIndex) => {
            //@ts-ignore
            return h(nestedChild, {
              class:
                nestedChildIndex !== nonNullishChildren.length - 1
                  ? stackNodeClass
                  : null,
            });
          }
        );
        return h(
          child,
          {
            class: childIndex !== children.length - 1 ? stackNodeClass : null,
          },
          [styledNestedChildren]
        );
      }
      return h(child, {
        class: childIndex !== children.length - 1 ? stackNodeClass : null,
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
            'justify-between': this.justify === 'between',
          },
        ],
      },
      [styledChildren]
    );
  },
});
</script>
