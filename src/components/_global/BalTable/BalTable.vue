<template>
  <div class="overflow-x-auto whitespace-nowrap rounded-lg" ref="tableRef">
    <table class="min-w-full">
      <thead
        class="bg-white w-full flex flex-row z-20"
        :class="{
          'sticky top-0': sticky === 'both' || sticky === 'vertical'
        }"
      >
        <td
          v-for="(column, columnIndex) in columns"
          :key="`header-${column.id}`"
          class="p-6 flex flex-grow bg-white headingShadow border-b border-gray-200 cursor-pointer"
          :class="[
            column.className,
            column.align === 'right' ? 'justify-end' : 'justify-start',
            getHorizontalStickyClass(columnIndex),
            isColumnStuck ? 'isSticky' : ''
          ]"
          :ref="setHeaderRef(columnIndex)"
          @click="handleSort(column.id)"
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
          <BalIcon
            name="arrow-up"
            v-if="
              currentSortColumn === column.id && currentSortDirection === 'asc'
            "
            class="ml-1"
          />
          <BalIcon
            name="arrow-down"
            v-if="
              currentSortColumn === column.id && currentSortDirection === 'desc'
            "
            class="ml-1"
          />
        </td>
      </thead>
      <BalLoadingBlock v-if="isLoading" :class="skeletonClass" />
      <tbody v-else>
        <tr
          v-for="(dataItem, index) in _data"
          :key="`tableRow-${index}`"
          class="flex flex-row bg-white z-10"
          @click="onRowClick(dataItem)"
        >
          <td
            v-for="(column, columnIndex) in columns"
            :key="column.id"
            :class="[
              column.className,
              column.align === 'right' ? 'justify-end' : 'justify-start',
              getHorizontalStickyClass(columnIndex),
              isColumnStuck ? 'isSticky' : ''
            ]"
            class="flex flex-grow bg-white"
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
import { defineComponent, onMounted, PropType, ref, watch } from 'vue';
import { sortBy } from 'lodash';
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
  // Dictates whether the column is sortable or not
  sortable?: boolean;
};

type Sticky = 'horizontal' | 'vertical' | 'both';

export default defineComponent({
  name: 'BalTable',

  props: {
    columns: {
      type: Object as PropType<Array<ColumnDefinition>>,
      required: true
    },
    data: {
      type: Object as PropType<Array<any>>,
      required: true
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
    },
    onRowClick: {
      type: Function
    },
    sticky: {
      type: Object as PropType<Sticky>
    }
  },
  setup(props) {
    const stickyHeaderRef = ref();
    const tableRef = ref<HTMLElement>();
    const isColumnStuck = ref(false);
    const _data = ref(props.data);
    const currentSortDirection = ref<'asc' | 'desc' | null>(null);
    const currentSortColumn = ref<string | null>(null);

    const setHeaderRef = (columnIndex: number) => (el: HTMLElement) => {
      if (el && columnIndex === 0) {
        stickyHeaderRef.value = el;
      }
    };

    // Need a method for horizontal stickiness as we need to
    // check whether the table item belongs in the first column
    const getHorizontalStickyClass = index => {
      if (index !== 0) return '';
      if (props.sticky === 'horizontal' || props.sticky === 'both') {
        return 'horizontalSticky';
      }
      return '';
    };

    const handleRowClick = data => {
      props.onRowClick && props.onRowClick(data);
    };

    const handleSort = (columnId: string) => {
      currentSortColumn.value = columnId;
      if (currentSortDirection.value === null) {
        currentSortDirection.value = 'asc';
      } else if (currentSortDirection.value === 'asc') {
        currentSortDirection.value = 'desc';
      } else {
        currentSortDirection.value = null;
      }

      const column = props.columns.find(column => column.id === columnId);
      if (column?.accessor) {
        const sortedData = sortBy(props.data, column.accessor);

        if (currentSortDirection.value === 'asc') {
          _data.value = sortedData;
        } else if (currentSortDirection.value === 'desc') {
          _data.value = sortedData.reverse();
        }
        _data.value = sortedData;
      }
    };

    onMounted(() => {
      if (tableRef.value) {
        tableRef.value.onscroll = () => {
          if (tableRef.value) {
            if (props.sticky === 'both') {
              isColumnStuck.value = !!(stickyHeaderRef.value.offsetLeft > 0);
            } else {
              isColumnStuck.value = !!(
                stickyHeaderRef.value.offsetLeft >
                stickyHeaderRef.value.offsetWidth * 1.1
              );
            }
          }
        };
      }
    });

    watch(
      () => props.data,
      newData => {
        _data.value = newData;
      }
    );

    return {
      //refs
      tableRef,

      // methods
      setHeaderRef,
      getHorizontalStickyClass,
      handleSort,
      handleRowClick,

      //data
      isColumnStuck,
      _data,
      currentSortColumn,
      currentSortDirection,
      console
    };
  }
});
</script>

<style>
.horizontalSticky {
  position: sticky;
  left: 0;
}

.horizontalSticky::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: -1px;
  width: 30px;
  transform: translateX(100%);
  transition: box-shadow 0.3s;
  content: '';
  pointer-events: none;
}

.isSticky::after {
  box-shadow: inset 10px 0 8px -8px rgb(0 0 0 / 15%);
}
</style>
