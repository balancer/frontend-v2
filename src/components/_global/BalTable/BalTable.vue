<template>
  <div class="overflow-x-auto whitespace-nowrap">
    <table class="min-w-full">
      <thead class="bg-white shadow-sm w-full flex flex-row">
        <td
          v-for="column in columns"
          :key="column.id"
          class="p-6 flex flex-grow"
          :class="[
            column.className,
            column.align === 'right' ? 'justify-end' : 'justify-start'
          ]"
        >
          <slot
            v-if="column.Header"
            v-bind="column"
            :name="column.Header"
          ></slot>
          <div v-else>
            <h5 class="text-base font-semibold text-gray-800">
              {{ column.name }}
            </h5>
          </div>
        </td>
      </thead>
      <BalLoadingBlock v-if="isLoading" :class="skeletonClass" />
      <tbody v-else>
        <tr
          v-for="dataItem in data"
          :key="dataItem[dataKey]"
          class="flex flex-row"
        >
          <td
            v-for="column in columns"
            :key="column.id"
            :class="[
              column.className,
              column.align === 'right' ? 'justify-end' : 'justify-start'
            ]"
            class="flex flex-grow"
          >
            <slot
              v-if="column.Cell"
              v-bind="dataItem"
              :name="column.Cell"
            ></slot>
            <div v-else class="px-6 py-8">
              {{
                typeof column.accessor === 'string'
                  ? dataItem[column.accessor]
                  : column.accessor(dataItem)
              }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, watch } from 'vue';

export type ColumnDefinition = {
  // Column Header Label
  name: string;
  // Unique ID
  id: string;
  // Key or function to access data from the row
  accessor: string | ((row: unknown) => string);
  // Slot ID for custom rendering the cell
  Cell?: string;
  // Slot ID for custom rendering a header
  Header?: string;
  // Is the column sortable
  isSortable?: boolean;
  // Extra classes to supply to the column. E.g. min width
  className?: string;
  // Left or right aligned content. E.g. Numbers should be right aligned
  align?: 'left' | 'right';
};

export default defineComponent({
  name: 'BalTable',

  props: {
    columns: {
      type: Object as PropType<Array<ColumnDefinition>>,
      required: true
    },
    data: {
      type: Object as PropType<Array<any>>
    },
    dataKey: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: () => false
    },
    skeletonClass: {
      type: String
    }
  }
});
</script>
