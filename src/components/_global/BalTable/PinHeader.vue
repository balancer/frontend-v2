<script setup lang="ts">
import pin from '@/assets/images/icons/pin.svg';
</script>

<template>
  <tr>
    <td class="px-6 pt-4 pb-2">
      <BalStack horizontal spacing="sm">
        <img :src="pin" />
        <span class="text-secondary text-medium">Pinned</span>
      </BalStack>
    </td>
  </tr>
</template>
