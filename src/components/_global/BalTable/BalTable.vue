<template>
  <div class="overflow-x-auto whitespace-nowrap" ref="tableRef">
    <table class="min-w-full">
      <thead class="bg-white shadow-sm w-full flex flex-row">
        <td
          v-for="(column, columnIndex) in columns"
          :key="`header-${column.id}`"
          class="p-6 flex flex-grow bg-white"
          :class="[
            column.className,
            column.align === 'right' ? 'justify-end' : 'justify-start',
            getStickyClass(columnIndex),
            isHeaderStuck ? 'isSticky' : ''
          ]"
          :ref="setHeaderRef(columnIndex)"
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
          class="flex flex-row bg-white"
        >
          <td
            v-for="(column, columnIndex) in columns"
            :key="column.id"
            :class="[
              column.className,
              column.align === 'right' ? 'justify-end' : 'justify-start',
              getStickyClass(columnIndex),
              isColumnStuck ? 'isSticky' : ''
            ]"
            class="flex flex-grow bg-white"
            :ref="setColumnRef(columnIndex)"
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
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  watch
} from 'vue';
import * as Sticky from 'sticky-js';

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
    sticky: {
      type: Object as PropType<Sticky>
    }
  },
  setup(props) {
    const stickyHeaderRef = ref();
    const tableRef = ref<HTMLElement>();
    const isHeaderStuck = ref(false);
    const isColumnStuck = ref(false);
    const stickyColumnRefs: Array<HTMLElement> = reactive([]);

    const setHeaderRef = (columnIndex: number) => (el: HTMLElement) => {
      if (el && columnIndex === 0) {
        stickyHeaderRef.value = el;
      }
    };

    const setColumnRef = (columnIndex: number) => (el: HTMLElement) => {
      if (el && columnIndex === 0) {
        stickyColumnRefs.push(el);
      }
    };

    const getStickyClass = index => {
      if (index !== 0) return '';
      if (props.sticky === 'horizontal') {
        return 'horizontalSticky';
      }
      if (props.sticky === 'vertical') {
        return 'verticalSticky';
      }
      return 'combinedSticky';
    };

    onMounted(() => {
      if (tableRef.value) {
        tableRef.value.onscroll = () => {
          if (tableRef.value) {
            isHeaderStuck.value = !!(
              stickyHeaderRef.value.offsetLeft >
              stickyHeaderRef.value.offsetWidth * 1.1
            );

            isColumnStuck.value = !!(
              stickyHeaderRef.value.offsetLeft >
              stickyHeaderRef.value.offsetWidth * 1.1
            );
          }
        };
      }
    });

    return {
      setHeaderRef,
      getStickyClass,
      tableRef,
      isHeaderStuck,
      setColumnRef,
      isColumnStuck
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
