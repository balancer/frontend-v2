<script setup lang="ts">
import { compact } from 'lodash';

import {
  ColumnDefinition,
  Data,
  Sticky,
} from '@/components/_global/BalTable/types';

type Props = {
  columns: ColumnDefinition<any>[];
  onRowClick?: (data: any, inNewTab?: boolean) => void;
  data: any;
  link?: {
    to: string;
    getParams: (data: any) => Record<string, string>;
  } | null;
  href?: { getHref: (data: any) => string | null } | null;
  sticky?: Sticky;
  isColumnStuck?: boolean;
  pinned?: boolean;
};

const props = defineProps<Props>();

function handleRowClick(data: Data, inNewTab = false) {
  if (props.link?.to) return;
  props.onRowClick && props.onRowClick(data, inNewTab);
}

// Need a method for horizontal stickiness as we need to
// check whether the table item belongs in the first column
function getHorizontalStickyClass(index: number) {
  if (index !== 0) return '';
  if (props.sticky === 'horizontal' || props.sticky === 'both') {
    return 'horizontalSticky';
  }
  return '';
}

function handleColumnClick(column: ColumnDefinition, event: Event) {
  // Disable default onClick when column is a checkbox
  if (column.isCheckbox && event.target?.['type'] !== 'checkbox') {
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

<template>
  <tr
    :class="[
      'bg-white z-10 row-bg group',
      {
        'cursor-pointer': handleRowClick,
        'border-b dark:border-gray-700': pinned,
      },
    ]"
    @click.exact="handleRowClick(data)"
    @click.meta="handleRowClick(data, true)"
    @click.ctrl="handleRowClick(data, true)"
  >
    <td
      v-for="(column, columnIndex) in columns"
      :key="column.id + columnIndex"
      :class="[
        column.align === 'right' ? 'text-left' : 'text-right',
        getHorizontalStickyClass(columnIndex),
        isColumnStuck ? 'isSticky' : '',
        column.isCheckbox ? 'cursor-default' : '',
      ]"
      @click="handleColumnClick(column, $event)"
    >
      <component
        :is="href?.getHref(data) ? 'a' : link ? 'router-link' : 'div'"
        :to="
          link
            ? {
                name: link.to,
                params: link.getParams(data),
              }
            : null
        "
        :href="href?.getHref(data)"
      >
        <slot v-if="column.Cell" v-bind="data" :name="column.Cell" />
        <div
          v-else
          :class="
            compact([
              'mr-6 py-4',
              column.align === 'right' ? 'text-right' : 'text-left',
              column.cellClassName,
            ])
          "
        >
          {{
            typeof column.accessor === 'string'
              ? data[column.accessor]
              : column.accessor(data)
          }}
        </div>
      </component>
    </td>
  </tr>
</template>
