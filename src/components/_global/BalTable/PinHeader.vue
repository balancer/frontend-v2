<script setup lang="ts">
import { buildURL } from '@/lib/utils/urls';
</script>

<template>
  <tr>
    <td class="px-6 pt-4 pb-2">
      <BalStack horizontal spacing="sm">
        <img :src="buildURL(`/src/assets/images/icons/pin.svg`)" />
        <span class="text-secondary text-medium">Pinned</span>
      </BalStack>
    </td>
  </tr>
</template>
