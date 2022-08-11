<script setup lang="ts">
import { compact } from 'lodash';
import { Ref } from 'vue';

import {
  ColumnDefinition,
  Data,
  Sticky,
} from '@/components/_global/BalTable/types';

type Props = {
  columns: ColumnDefinition<any>[];
  onRowClick?: (data: any) => void;
  data: Ref<any>;
  link?: {
    to: string;
    getParams: (data: any) => Record<string, string>;
  } | null;
  sticky?: Sticky;
  isColumnStuck?: boolean;
  pinned?: boolean;
};

const props = defineProps<Props>();

function handleRowClick(data: Data) {
  if (props.link?.to) return;
  props.onRowClick && props.onRowClick(data);
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
    @click="handleRowClick(data)"
  >
    <td
      v-for="(column, columnIndex) in columns"
      :key="column.id"
      :class="[
        column.align === 'right' ? 'text-left' : 'text-right',
        getHorizontalStickyClass(columnIndex),
        isColumnStuck ? 'isSticky' : '',
      ]"
    >
      <router-link
        v-if="link"
        :to="{
          name: link.to,
          params: link.getParams(data),
        }"
      >
        <slot v-if="column.Cell" v-bind="data" :name="column.Cell" />
        <div
          v-else
          :class="
            compact([
              'px-6 py-4',
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
      </router-link>
      <template v-else>
        <slot v-if="column.Cell" v-bind="data" :name="column.Cell" />
        <div
          v-else
          :class="
            compact([
              'px-6 py-4',
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
      </template>
    </td>
  </tr>
</template>
