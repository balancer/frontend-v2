<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import UnlockActions from './components/UnlockActions.vue';
import UnlockAmount from './components/UnlockAmount.vue';
import UnlockSummary from './components/UnlockSummary.vue';

/**
 * TYPES
 */
type Props = {
  lockablePool: Pool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo: VeBalLockInfo;
  totalLpTokens: string;
  fiatTotalLpTokens: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * COMPOSABLES
 */
const { refetch: refetchLockInfo } = useVeBalLockInfoQuery();

/**
 * STATE
 */
const unlockConfirmed = ref(false);
const lockablePool = ref(props.lockablePool);
const lockablePoolTokenInfo = ref(props.lockablePoolTokenInfo);
const veBalLockInfo = ref(props.veBalLockInfo);
const totalLpTokens = ref(props.totalLpTokens);
const fiatTotalLpTokens = ref(props.fiatTotalLpTokens);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * COMPUTED
 */
const title = computed(() => {
  return unlockConfirmed.value
    ? t(`unlockVeBAL.previewModal.titles.unlock.confirmed`)
    : t(`unlockVeBAL.previewModal.titles.unlock.default`);
});

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}

function handleSuccess() {
  unlockConfirmed.value = true;
  refetchLockInfo.value();
}
</script>

<template>
  <BalModal show :fireworks="unlockConfirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="unlockConfirmed"
          size="8"
          color="green"
          class="mr-2 text-white"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ title }}
        </h4>
      </div>
    </template>

    <UnlockAmount :lockablePool="lockablePool" :totalLpTokens="totalLpTokens" />

    <UnlockSummary
      :fiatTotalLpTokens="fiatTotalLpTokens"
      :veBalLockInfo="veBalLockInfo"
    />

    <UnlockActions
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :totalLpTokens="totalLpTokens"
      :veBalLockInfo="veBalLockInfo"
      class="mt-4"
      @success="handleSuccess"
      @close="handleClose"
    />
  </BalModal>
</template>
