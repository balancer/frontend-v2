<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * TYPES
 */
type Props = {
  tableData: { title: string; value: string; link?: string }[];
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
    <div
      v-for="{ title, value, link } in tableData"
      :key="title"
      class="table-row"
    >
      <div class="table-row-title">
        {{ title }}
      </div>
      <div class="table-row-value">
        {{ value }}
        <BalLink v-if="link" :href="link" external noStyle>
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="mt-2 ml-2 text-gray-500 hover:text-blue-500 transition-colors"
          />
        </BalLink>
      </div>
    </div>
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