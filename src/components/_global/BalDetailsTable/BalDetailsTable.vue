<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { BalDetailsTableData } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  tableData: (BalDetailsTableData | null)[];
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
        <div class="table-row-title">
          {{ row.title }}
        </div>
        <div class="table-row-value">
          {{ row.value }}
          <BalTooltip
            v-if="row.tooltip"
            :text="row.tooltip"
            iconSize="sm"
            class="mt-1 ml-2"
          />
          <div v-if="row.linksList" class="flex flex-col">
            <div v-for="link in row.linksList" :key="link.title">
              <span v-if="link.tokenSymbol"> {{ link.tokenSymbol }}: </span>
              <BalLink :href="link.link" external noStyle class="mr-1">
                {{ link.title }}
                <BalIcon
                  name="arrow-up-right"
                  size="sm"
                  class="mt-2 text-gray-500 hover:text-blue-500 transition-colors"
                />
              </BalLink>
              <BalTooltip
                v-if="link.warningText"
                :text="link.warningText"
                iconSize="md"
                iconName="alert-triangle"
                iconClass="text-orange-500"
                class="relative top-1"
              />
            </div>
          </div>
          <BalLink v-if="row.link" :href="row.link" external noStyle>
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