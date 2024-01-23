<script lang="ts" setup>
import { buildProtocolIconURL } from '@/lib/utils/urls';
</script>

<template>
  <BalLink
    href="https://swap.cow.fi"
    external
    noStyle
    class="flex items-center p-4 text-sm dark:bg-gray-850 rounded-lg border dark:border-0"
  >
    <img
      :src="buildProtocolIconURL('cowswap')"
      alt="CoW Swap"
      class="mr-4 w-6 h-6"
    />
    Swap gasless on CoW Swap
    <BalIcon
      name="arrow-up-right"
      size="sm"
      class="ml-2 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
    />
  </BalLink>
</template>
