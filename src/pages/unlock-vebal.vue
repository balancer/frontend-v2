<script setup lang="ts">
import UnlockForm from '@/components/forms/lock_actions/UnlockForm/UnlockForm.vue';
import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <UnlockForm v-if="isVeBalSupported" />
  <div v-else class="text-center">
    <div class="text-lg font-semibold">
      {{ $t('veBAL.notSupported.title') }}
    </div>
    <div>{{ $t('veBAL.notSupported.description') }}</div>
  </div>
</template>
