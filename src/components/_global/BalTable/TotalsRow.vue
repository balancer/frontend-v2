<script setup lang="ts">
import { tail } from 'lodash';

import { ColumnDefinition, Sticky } from '@/components/_global/BalTable/types';

type Props = {
  isColumnStuck?: boolean;
  onRowClick?: (data: any) => void;
  sticky?: Sticky;
  columns: ColumnDefinition<any>[];
};

const props = defineProps<Props>();

/** FUNCTIONS */
// Need a method for horizontal stickiness as we need to
// check whether the table item belongs in the first column
function getHorizontalStickyClass(index: number) {
  if (index !== 0) return '';
  if (props.sticky === 'horizontal' || props.sticky === 'both') {
    return 'horizontalSticky';
  }
  return '';
}
</script>

<template>
  <tbody>
    <tr
      :class="[
        'bg-white z-10 row-bg group',
        { 'cursor-pointer': !!props.onRowClick },
      ]"
    >
      <td
        :class="[
          getHorizontalStickyClass(0),
          isColumnStuck ? 'isSticky' : '',
          'text-left p-6 bg-white dark:bg-gray-850 border-t dark:border-gray-900 align-top',
        ]"
      >
        <span class="font-semibold text-left"> Total </span>
      </td>
      <td
        v-for="(column, columnIndex) in tail(columns)"
        :key="column.id"
        :class="[
          column.align === 'right' ? 'text-left' : 'text-right',
          getHorizontalStickyClass(columnIndex + 1),
          isColumnStuck ? 'isSticky' : '',
          'p-6 bg-white dark:bg-gray-850 border-t dark:border-gray-900',
        ]"
      >
        <slot v-if="column.totalsCell" :name="column.totalsCell" />
      </td>
    </tr>
  </tbody>
</template>
