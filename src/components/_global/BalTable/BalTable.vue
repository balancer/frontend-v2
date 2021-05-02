<template>
  <div class="overflow-x-auto whitespace-nowrap rounded-lg" ref="tableRef">
    <table class="min-w-full whitespace-normal">
      <thead
        :class="[
          'bg-white w-full flex flex-row z-20',
          { 'sticky top-0': sticky === 'both' || sticky === 'vertical' }
        ]"
      >
        <td
          v-for="(column, columnIndex) in filteredColumns"
          :key="`header-${column.id}`"
          :class="[
            'p-6 flex bg-white headingShadow border-b border-gray-200 cursor-pointer',
            column.noGrow ? '' : 'flex-grow',
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
      <BalLoadingBlock v-if="isLoading" :class="skeletonClass" square />
      <tbody v-else>
        <tr
          v-for="(dataItem, index) in tableData"
          :key="`tableRow-${index}`"
          @click="onRowClick(dataItem)"
          :class="[
            'flex flex-grow bg-white z-10 rowBg',
            { 'cursor-pointer': onRowClick }
          ]"
        >
          <td
            v-for="(column, columnIndex) in filteredColumns"
            :key="column.id"
            :class="[
              'flex',
              column.className,
              column.align === 'right' ? 'justify-end' : 'justify-start',
              getHorizontalStickyClass(columnIndex),
              isColumnStuck ? 'isSticky' : '',
              column.noGrow ? '' : 'flex-grow'
            ]"
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
import {
  defineComponent,
  onMounted,
  PropType,
  ref,
  watch,
  computed
} from 'vue';
import { sortBy } from 'lodash';

type Sticky = 'horizontal' | 'vertical' | 'both';
type Data = any;

export type ColumnDefinition<T = Data> = {
  // Column Header Label
  name: string;
  // Unique ID
  id: string;
  // Key or function to access data from the row
  accessor: string | ((row: T) => string);
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
  // Should the column width grow to fit available space?
  noGrow?: boolean;
  // Set to true to hide the column
  hidden?: boolean;
  // Accessor for sorting purposes
  sortKey?: string | ((row: T) => unknown);
};

export default defineComponent({
  name: 'BalTable',

  props: {
    columns: {
      type: Object as PropType<ColumnDefinition[]>,
      required: true
    },
    data: {
      type: Object as PropType<Data[]>
    },
    isLoading: {
      type: Boolean,
      default: () => false
    },
    skeletonClass: {
      type: String
    },
    onRowClick: {
      type: Function as PropType<(data: Data) => void>
    },
    sticky: {
      type: String as PropType<Sticky>
    }
  },
  setup(props) {
    const stickyHeaderRef = ref();
    const tableRef = ref<HTMLElement>();
    const isColumnStuck = ref(false);
    const tableData = ref(props.data);
    const currentSortDirection = ref<'asc' | 'desc' | null>(null);
    const currentSortColumn = ref<string | null>(null);

    const setHeaderRef = (columnIndex: number) => (el: HTMLElement) => {
      if (el && columnIndex === 0) {
        stickyHeaderRef.value = el;
      }
    };

    // Need a method for horizontal stickiness as we need to
    // check whether the table item belongs in the first column
    const getHorizontalStickyClass = (index: number) => {
      if (index !== 0) return '';
      if (props.sticky === 'horizontal' || props.sticky === 'both') {
        return 'horizontalSticky';
      }
      return '';
    };

    const handleRowClick = (data: Data) => {
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
      if (column?.sortKey) {
        const sortedData = sortBy(props.data, column.sortKey);
        if (currentSortDirection.value === 'asc') {
          tableData.value = sortedData;
        } else if (currentSortDirection.value === 'desc') {
          tableData.value = sortedData.reverse();
        }
        tableData.value = sortedData;
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

    const filteredColumns = computed(() =>
      props.columns.filter(column => !column.hidden)
    );

    watch(
      () => props.data,
      newData => {
        tableData.value = newData;
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
      tableData,
      currentSortColumn,
      currentSortDirection,

      // computed
      filteredColumns
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
  bottom: 0;
  width: 30px;
  transform: translateX(100%);
  transition: box-shadow 0.3s;
  content: '';
  pointer-events: none;
}

.isSticky::after {
  box-shadow: inset 10px 0 8px -8px rgb(0 0 0 / 15%);
}

.rowBg > td {
  @apply bg-white;
}

.rowBg:hover > td {
  @apply bg-gray-50;
}
</style>
