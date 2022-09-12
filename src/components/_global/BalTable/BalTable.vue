<script setup lang="ts">
import BalIcon from '../BalIcon/BalIcon.vue';
import BalTableRow from './BalTableRow.vue';
import TotalsRow from './TotalsRow.vue';
import { Sticky, Data, ColumnDefinition } from './types';
import { sortBy, sumBy } from 'lodash';
import { computed, onMounted, ref, watch, toRef } from 'vue';

import PinHeader from './PinHeader.vue';

type InitialState = {
  sortDirection: 'asc' | 'desc' | null;
  sortColumn: string | null;
};

type DataPinState = {
  // the key inside each data object that you want to
  // pin by
  pinOn: string;
  pinnedData: string[];
};

defineEmits(['loadMore']);

type Props = {
  columns: ColumnDefinition[];
  data: Data[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  skeletonClass?: string;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  onRowClick?: (data: Data) => void;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  sticky?: Sticky;
  square?: boolean;
  isPaginated?: boolean;
  noResultsLabel?: string;
  link?: {
    to: string;
    getParams: (data: any) => Record<string, string>;
  } | null;
  initialState?: InitialState;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  pin?: DataPinState | null;
  getTableRowClass?: (rowData: Data, rowIndex: number) => string;
};

const props = withDefaults(defineProps<Props>(), {
  square: false,
  isPaginated: false,
  noResultsLabel: '',
  link: null,
  initialState: () => ({
    sortColumn: null,
    sortDirection: null,
  }),
  skeletonClass: '',
  isLoading: false,
  isLoadingMore: false,
  getTableRowClass: () => '',
});

const stickyHeaderRef = ref();
const isColumnStuck = ref(false);
const tableData = ref(props.data);
const currentSortDirection = ref<InitialState['sortDirection']>(
  props.initialState?.sortDirection || null
);
const currentSortColumn = ref<InitialState['sortColumn']>(
  props.initialState?.sortColumn || null
);
const headerRef = ref<HTMLElement>();
const bodyRef = ref<HTMLElement>();

const getTableRowClass = toRef(props, 'getTableRowClass');

// for loading and no results
const placeholderBlockWidth = computed(() => sumBy(props.columns, 'width'));

// Need a method for horizontal stickiness as we need to
// check whether the table item belongs in the first column
const getHorizontalStickyClass = (index: number) => {
  if (index !== 0) return '';
  if (props.sticky === 'horizontal' || props.sticky === 'both') {
    return 'horizontalSticky';
  }
  return '';
};

const handleSort = (columnId: string | null, updateDirection = true) => {
  const column = props.columns.find(column => column.id === columnId);
  if (!column?.sortKey) return;
  if (columnId !== currentSortColumn.value) currentSortDirection.value = null;

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

function getAlignProperty(align: 'left' | 'right' | 'center' | undefined) {
  switch (align) {
    case 'left':
      return 'justify-start';
    case 'right':
      return 'justify-end';
    case 'center':
      return 'justify-center';
    default:
      return 'justify-start';
  }
}

onMounted(() => {
  if (bodyRef.value) {
    bodyRef.value.onscroll = () => {
      if (bodyRef.value && stickyHeaderRef.value) {
        const offsetRatio =
          bodyRef.value.offsetWidth / stickyHeaderRef.value.offsetWidth / 10;
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

  handleSort(currentSortColumn.value, false);
});

/**
 * COMPUTED
 */
const unpinnedData = computed(() => {
  if (!props.pin) return tableData.value;
  return (tableData.value || []).filter(
    data => !props.pin?.pinnedData.includes(data[props.pin.pinOn])
  );
});

const pinnedData = computed(() => {
  if (!props.pin) return [];
  return (tableData.value || []).filter(data =>
    props.pin?.pinnedData.includes(data[props.pin.pinOn])
  );
});

const filteredColumns = computed(() =>
  props.columns.filter(column => !column.hidden)
);

const shouldRenderTotals = computed(() =>
  props.columns.some(column => column.totalsCell !== undefined)
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
</script>

<template>
  <div
    :class="[
      'max-w-full whitespace-nowrap overflow-hidden',
      { 'rounded-lg': !square },
    ]"
  >
    <div ref="headerRef" class="overflow-hidden">
      <table class="w-full whitespace-normal table-fixed">
        <!-- header width handled by colgroup  -->
        <colgroup>
          <col
            v-for="column in filteredColumns"
            :key="column.id"
            :style="{ width: `${column?.width}px` }"
          />
        </colgroup>
        <!-- header is rendered as a row - seperated by columns -->
        <thead class="z-10 bg-white dark:bg-gray-900">
          <th
            v-for="(column, columnIndex) in filteredColumns"
            :key="`header-${column.id}`"
            :ref="columnIndex == 0 ? 'stickyHeaderRef' : undefined"
            :class="[
              'p-6 bg-white dark:bg-gray-850 headingShadow border-b dark:border-gray-900',
              column.className,
              getHorizontalStickyClass(columnIndex),
              isColumnStuck ? 'isSticky' : '',
              column.sortKey ? 'cursor-pointer' : '',
              currentSortColumn === column.id && currentSortDirection
                ? 'text-blue-600 hover:text-blue-500 focus:text-purple-600 dark:text-blue-400 dark:hover:text-blue-600 dark:focus:text-blue-600 transition-colors'
                : 'text-gray-800 hover:text-purple-600 focus:text-blue-500 dark:text-gray-100 dark:hover:text-yellow-500 dark:focus:text-yellow-500 transition-colors',
            ]"
            @click="handleSort(column.id)"
          >
            <div :class="['flex', getAlignProperty(column.align)]">
              <slot
                v-if="column.Header"
                v-bind="column"
                :name="column.Header"
              />
              <div v-else>
                <h5 class="text-base">
                  {{ column.name }}
                </h5>
              </div>
              <BalIcon
                v-if="
                  currentSortColumn === column.id &&
                  currentSortDirection === 'asc'
                "
                name="arrow-up"
                size="sm"
                class="flex items-center ml-1"
              />
              <BalIcon
                v-if="
                  currentSortColumn === column.id &&
                  currentSortDirection === 'desc'
                "
                name="arrow-down"
                size="sm"
                class="flex items-center ml-1"
              />
            </div>
          </th>
        </thead>
      </table>
    </div>
    <div ref="bodyRef" class="overflow-auto">
      <BalLoadingBlock
        v-if="isLoading"
        :class="[skeletonClass, 'min-w-full']"
        square
        :style="{ width: `${placeholderBlockWidth}px` }"
      />
      <div
        v-else-if="!isLoading && !tableData.length"
        class="flex justify-center items-center max-w-full h-40 bg-white dark:bg-gray-850 row-bg text-secondary"
      >
        {{ noResultsLabel || $t('noResults') }}
      </div>
      <table v-else class="w-full whitespace-normal table-fixed">
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
              'bg-white dark:bg-gray-850 p-0 m-0 h-0',
            ]"
          />
        </tr>
        <!-- end measurement row -->

        <!-- begin pinned rows -->
        <PinHeader v-if="pinnedData.length" />
        <BalTableRow
          v-for="(dataItem, index) in pinnedData"
          :key="`tableRow-${index}`"
          :class="getTableRowClass(dataItem, index)"
          :data="dataItem"
          :columns="filteredColumns"
          :onRowClick="onRowClick"
          :link="link"
          :sticky="sticky"
          :isColumnStuck="isColumnStuck"
          pinned
        >
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </BalTableRow>
        <!-- end pinned rows -->

        <!-- begin data rows -->
        <BalTableRow
          v-for="(dataItem, index) in unpinnedData"
          :key="`tableRow-${index}`"
          :class="
            props.getTableRowClass
              ? props.getTableRowClass(dataItem, index)
              : undefined
          "
          :data="dataItem"
          :columns="filteredColumns"
          :onRowClick="onRowClick"
          :link="link"
          :sticky="sticky"
          :isColumnStuck="isColumnStuck"
        >
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </BalTableRow>
        <!-- end end data rows -->
        <TotalsRow
          v-if="!isLoading && tableData.length && shouldRenderTotals"
          :columns="filteredColumns"
          :onRowClick="onRowClick"
          :sticky="sticky"
          :isColumnStuck="isColumnStuck"
        >
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </TotalsRow>
      </table>
    </div>
  </div>
  <div
    v-if="isPaginated && !isLoading"
    class="bal-table-pagination-btn text-secondary"
    @click="!isLoadingMore && $emit('loadMore')"
  >
    <template v-if="isLoadingMore">
      {{ $t('loading') }}
    </template>
    <template v-else>
      {{ $t('loadMore') }}
      <BalIcon name="chevron-down" size="sm" class="ml-2" />
    </template>
  </div>
</template>

<style>
.horizontalSticky {
  @apply z-10 opacity-95 xs:opacity-90;

  /* Set the sticky cell to inherit table row's background-color in order for the opacity property to have an effect */
  background-color: inherit;
  position: sticky;
  left: 0;
  width: 100%;
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

.row-bg {
  @apply bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800;
}

.bal-table-pagination-btn {
  @apply flex items-center justify-center h-16 transition-all;
  @apply font-medium hover:text-purple-600 dark:hover:text-yellow-500;
  @apply border-t dark:border-gray-900 rounded-b-lg;
  @apply hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer;
}
</style>
