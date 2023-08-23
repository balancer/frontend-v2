<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import { useUserIsDepositedInAffectedPool } from '@/pages/recovery-exit/useUserIsDepositedInAffectedPool';

/**
 * COMPOSABLES
 */
const { networkSlug } = useNetwork();

const { isUserDepositedInAffectedPool } = useUserIsDepositedInAffectedPool();
</script>

<template>
  <div v-if="isUserDepositedInAffectedPool" class="px-4 xl:px-0">
    <BalAlert
      type="error"
      title="Pool Vulnerability - August 22, 2023"
      actionLabel="Withdraw now"
      class="mb-4"
      block
      @action-click="
        $router.push({ name: 'recovery-exit', params: { networkSlug } })
      "
      >A vulnerability has been discovered that affects a pool you are deposited
      in. Please withdraw your funds as soon as possible.</BalAlert
    >
  </div>
</template>
