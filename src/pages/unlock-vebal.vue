<script setup lang="ts">
import UnlockForm from '@/components/forms/lock_actions/UnlockForm/UnlockForm.vue';

import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <UnlockForm v-if="isVeBalSupported" />
  <div v-else class="text-center">
    <div class="font-semibold text-lg">
      {{ $t('veBAL.notSupported.title') }}
    </div>
    <div>{{ $t('veBAL.notSupported.description') }}</div>
  </div>
</template>
