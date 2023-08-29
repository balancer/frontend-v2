<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import { lsGet, lsSet } from '@/lib/utils';
import { useUserIsDepositedInAffectedPool } from '@/pages/recovery-exit/useUserIsDepositedInAffectedPool';
import LS_KEYS from '@/constants/local-storage.keys';

/**
 * STATE
 */
const dismissed = ref<boolean>(
  lsGet(LS_KEYS.Alerts.RecoveryExitDismissed, false)
);

/**
 * COMPOSABLES
 */
const { networkSlug } = useNetwork();
const { isUserDepositedInAffectedPool } = useUserIsDepositedInAffectedPool();

function handleClose() {
  lsSet(LS_KEYS.Alerts.RecoveryExitDismissed, true);
  dismissed.value = true;
}
</script>

<template>
  <div v-if="isUserDepositedInAffectedPool && !dismissed" class="px-4 xl:px-0">
    <BalAlert
      type="error"
      title="Pool Vulnerability - August 22, 2023"
      actionLabel="Withdraw now"
      class="mb-4"
      block
      dismissable
      @close="handleClose"
      @action-click="
        $router.push({ name: 'recovery-exit', params: { networkSlug } })
      "
      >A vulnerability has been discovered that affects a pool you are deposited
      in. Please withdraw your funds as soon as possible.</BalAlert
    >
  </div>
</template>
