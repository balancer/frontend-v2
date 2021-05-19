<template>
  <div class="max-w-full whitespace-nowrap rounded-lg overflow-hidden">
    <div class="overflow-hidden" ref="headerRef">
      <table class="w-full table-fixed whitespace-normal">
        <colgroup>
          <col
            v-for="column in filteredColumns"
            :key="column.id"
            :style="{ width: `${column?.width}px` }"
          />
        </colgroup>
        <thead class="bg-white z-20">
          <th
            v-for="(column, columnIndex) in filteredColumns"
            :key="`header-${column.id}`"
            :class="[
              'p-6 bg-white headingShadow border-b',
              column.className,
              getHorizontalStickyClass(columnIndex),
              isColumnStuck ? 'isSticky' : '',
              column.sortKey ? 'cursor-pointer' : ''
            ]"
            :ref="setHeaderRef(columnIndex)"
            @click="handleSort(column.id)"
          >
            <div
              :class="[
                'flex',
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
              <BalIcon
                name="arrow-up"
                size="sm"
                v-if="
                  currentSortColumn === column.id &&
                    currentSortDirection === 'asc'
                "
                class="ml-1 flex items-center"
              />
              <BalIcon
                name="arrow-down"
                size="sm"
                v-if="
                  currentSortColumn === column.id &&
                    currentSortDirection === 'desc'
                "
                class="ml-1 flex items-center"
              />
            </div>
          </th>
        </thead>
      </table>
    </div>
    <div class="overflow-auto" ref="bodyRef">
      <BalLoadingBlock
        v-if="isLoading"
        :class="[skeletonClass, 'min-w-full']"
        square
        :style="{ width: `${placeholderBlockWidth}px` }"
      />
      <div
        v-if="!isLoading && !tableData.length"
        class="max-w-full bg-white rowBg h-40 flex items-center justify-center text-gray-500"
      >
        {{ noResultsLabel || $t('noResults') }}
      </div>
      <table class="w-full table-fixed whitespace-normal">
        <colgroup>
          <col
            v-for="column in filteredColumns"
            :key="column.id"
            :style="{ width: `${column?.width}px` }"
          />
        </colgroup>
        <!-- begin measurement row -->
        <tr>
          <td
            v-for="(column, columnIndex) in filteredColumns"
            :key="column.id"
            :class="[
              column.align === 'right' ? 'text-left' : 'text-right',
              getHorizontalStickyClass(columnIndex),
              isColumnStuck ? 'isSticky' : '',
              'p-0 m-0 h-0'
            ]"
          ></td>
        </tr>
        <!-- end measurement row -->
        <tbody v-if="!isLoading && tableData.length">
          <tr
            v-for="(dataItem, index) in tableData"
            :key="`tableRow-${index}`"
            @click="onRowClick && onRowClick(dataItem)"
            :class="['bg-white z-10 rowBg', { 'cursor-pointer': onRowClick }]"
          >
            <td
              v-for="(column, columnIndex) in filteredColumns"
              :key="column.id"
              :class="[
                column.align === 'right' ? 'text-left' : 'text-right',
                getHorizontalStickyClass(columnIndex),
                isColumnStuck ? 'isSticky' : ''
              ]"
            >
              <slot
                v-if="column.Cell"
                v-bind="dataItem"
                :name="column.Cell"
              ></slot>
              <div
                v-else
                :class="[
                  'px-6 py-4',
                  column.align === 'right' ? 'text-right' : 'text-left'
                ]"
              >
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
  </div>
  <div
    v-if="isPaginated && !isLoading"
    class="bal-table-pagination-btn"
    @click="!isLoadingMore && $emit('loadMore')"
  >
    <template v-if="isLoadingMore">{{ $t('loading') }}</template>
    <template v-else
      >{{ $t('loadMore') }} <BalIcon name="chevron-down" size="sm" class="ml-2"
    /></template>
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
import { sortBy, sumBy } from 'lodash';

type Sticky = 'horizontal' | 'vertical' | 'both';
type Data = any;

type InitialState = {
  sortDirection: 'asc' | 'desc' | null;
  sortColumn: string | null;
};

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
  // Should the column width grow to fit available space?
  noGrow?: boolean;
  // Set to true to hide the column
  hidden?: boolean;
  // Accessor for sorting purposes
  sortKey?: string | ((row: T) => unknown);

  width?: number;
};

export default defineComponent({
  name: 'BalTable',

  emits: ['loadMore'],

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
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    skeletonClass: {
      type: String
    },
    onRowClick: {
      type: Function as PropType<(data: Data) => void>
    },
    sticky: {
      type: String as PropType<Sticky>
    },
    isPaginated: {
      type: Boolean,
      default: false
    },
    noResultsLabel: {
      type: String
    },
    initialState: {
      type: Object as PropType<InitialState>,
      default: () => ({
        sortColumn: null,
        sortDirection: null
      })
    }
  },
  setup(props) {
    const stickyHeaderRef = ref();
    const tableRef = ref<HTMLElement>();
    const isColumnStuck = ref(false);
    const tableData = ref(props.data);
    const currentSortDirection = ref<InitialState['sortDirection']>(
      props.initialState.sortDirection
    );
    const currentSortColumn = ref<InitialState['sortColumn']>(
      props.initialState.sortColumn
    );
    const headerRef = ref<HTMLElement>();
    const bodyRef = ref<HTMLElement>();

    // for loading and no results
    const placeholderBlockWidth = computed(() => sumBy(props.columns, 'width'));

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

    const handleSort = (columnId: string | null, updateDirection = true) => {
      const column = props.columns.find(column => column.id === columnId);
      if (!column?.sortKey) return;
      if (columnId !== currentSortColumn.value)
        currentSortDirection.value = null;

      currentSortColumn.value = columnId;

      if (updateDirection) {
        if (currentSortDirection.value === null) {
          currentSortDirection.value = 'desc';
        } else if (currentSortDirection.value === 'desc') {
          currentSortDirection.value = 'asc';
        } else {
          currentSortDirection.value = null;
        }
      }

      const sortedData = sortBy(
        (props.data as any).value || props.data,
        column.sortKey
      );
      if (currentSortDirection.value === 'asc') {
        tableData.value = sortedData;
        return;
      } else if (currentSortDirection.value === 'desc') {
        tableData.value = sortedData.reverse();
        return;
      }
      tableData.value = props.data;
    };

    onMounted(() => {
      if (bodyRef.value) {
        bodyRef.value.onscroll = () => {
          if (bodyRef.value) {
            const offsetRatio =
              bodyRef.value.offsetWidth /
              stickyHeaderRef.value.offsetWidth /
              10;
            isColumnStuck.value = !!(
              stickyHeaderRef.value.offsetLeft >
              stickyHeaderRef.value.offsetWidth * offsetRatio
            );
          }
        };
        bodyRef.value.addEventListener('scroll', () => {
          if (bodyRef.value && headerRef.value) {
            headerRef.value.scrollLeft = bodyRef.value.scrollLeft;
          }
        });
      }
    });

    const filteredColumns = computed(() =>
      props.columns.filter(column => !column.hidden)
    );

    watch(
      () => props.data,
      newData => {
        if (currentSortColumn.value && currentSortDirection.value !== null) {
          handleSort(currentSortColumn.value, false);
          return;
        }
        tableData.value = newData;
      }
    );

    return {
      //refs
      tableRef,
      headerRef,
      bodyRef,

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
      placeholderBlockWidth,

      // computed
      filteredColumns
    };
  }
});
</script>

<style>
.horizontalSticky {
  @apply z-10;
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

.bal-table-pagination-btn {
  @apply flex items-center justify-center h-16;
  @apply text-gray-500 font-medium hover:text-gray-800;
  @apply border-t rounded-b-lg;
  @apply hover:bg-gray-50 cursor-pointer;
}
</style>
