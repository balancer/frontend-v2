<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import LockAmount from './components/LockAmount.vue';
import LockSummary from './components/LockSummary.vue';
import LockActions from './components/LockActions.vue';

import { TokenInfo } from '@/types/TokenList';
import { LockType } from '../../types';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  lockAmount: string;
  lockEndDate: string;
  expectedVeBalAmount: string;
  lockType: LockType[];
  veBalLockInfo: VeBalLockInfo;
  totalLpTokens: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * STATE
 */
const lockConfirmed = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * COMPUTED
 */
const title = computed(() => {
  if (props.lockType.length === 1) {
    return lockConfirmed.value
      ? t(`getVeBAL.previewModal.titles.${props.lockType[0]}.confirmed`)
      : t(`getVeBAL.previewModal.titles.${props.lockType[0]}.default`);
  }
  return lockConfirmed.value
    ? t(`getVeBAL.previewModal.titles.${LockType.CREATE_LOCK}.confirmed`)
    : t(`getVeBAL.previewModal.titles.${LockType.CREATE_LOCK}.default`);
});

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}
</script>

<template>
  <BalModal show :fireworks="lockConfirmed" @close="handleClose">
    <template v-slot:header>
      <div class="flex items-center">
        <BalCircle
          v-if="withdrawalConfirmed"
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

    <LockAmount :lockablePool="lockablePool" :totalLpTokens="totalLpTokens" />

    <LockSummary
      :lockablePool="lockablePool"
      :totalLpTokens="totalLpTokens"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :expectedVeBalAmount="expectedVeBalAmount"
      :lockType="lockType"
      :veBalLockInfo="veBalLockInfo"
    />

    <LockActions
      :lockablePool="lockablePool"
      :lockAmount="lockAmount"
      :lockEndDate="lockEndDate"
      :lockType="lockType"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      @success="lockConfirmed = true"
      class="mt-4"
    />
  </BalModal>
</template>
