<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import UnlockAmount from './components/UnlockAmount.vue';
import UnlockActions from './components/UnlockActions.vue';
import UnlockSummary from './components/UnlockSummary.vue';

import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo: VeBalLockInfo;
  totalLpTokens: string;
  fiatTotalLpTokens: string;
};

/**
 * PROPS & EMITS
 */
defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * STATE
 */
const unlockConfirmed = ref(false);

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
</script>

<template>
  <BalModal show :fireworks="unlockConfirmed" @close="handleClose">
    <template v-slot:header>
      <div class="flex items-center">
        <BalCircle
          v-if="unlockConfirmed"
          size="8"
          color="green"
          class="text-white mr-2"
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
      @success="unlockConfirmed = true"
      class="mt-4"
    />
  </BalModal>
</template>
