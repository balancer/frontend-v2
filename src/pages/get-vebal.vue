<script setup lang="ts">
import LockForm from '@/components/forms/lock_actions/LockForm/LockForm.vue';

import { isVeBalSupported } from '@/composables/useVeBAL';
</script>

<template>
  <LockForm v-if="isVeBalSupported" />
  <div v-else class="text-center">
    <div class="font-semibold text-lg">
      {{ $t('veBAL.notSupported.title') }}
    </div>
    <div>{{ $t('veBAL.notSupported.description') }}</div>
  </div>
</template>
