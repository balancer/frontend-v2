<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * TYPES
 */
type Props = {
  // tableData: { title: string; values: { text: string; link?: string }[] }[];
  tableData: any;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
</script>

<template>
  <BalCard class="overflow-x-auto" :square="upToLargeBreakpoint" noPad>
    <template v-for="(row, i) in tableData" :key="i">
      <div v-if="row" class="table-row">
        <div v-for="{ text, link } in row" :key="text" class="table-row-title">
          <div>{{ text }}</div>
          <BalLink v-if="link" :href="link" external noStyle>
            <BalIcon
              name="arrow-up-right"
              size="sm"
              class="mt-2 ml-2 text-gray-500 hover:text-blue-500 transition-colors"
            />
          </BalLink>
        </div>
      </div>
    </template>
  </BalCard>
</template>

<style scoped>
.table-row {
  @apply flex border-b dark:border-gray-700;
}

.table-row:first-child {
  @apply font-semibold bg-gray-50 dark:bg-gray-800;
}

.table-row:last-child {
  @apply border-b-0;
}

.table-row-title {
  @apply flex items-center py-3 px-4 flex-1 dark:border-gray-700;

  border-right-width: 1px;
}

.table-row-value {
  @apply flex py-3 px-4 items-center;

  word-break: break-all;
  flex: 2;
}
</style>