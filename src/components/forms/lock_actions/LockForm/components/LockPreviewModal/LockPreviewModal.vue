<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';

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
  lockedUntil: string;
  expectedVeBalAmount: string;
  lockType: LockType;
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

const lockConfirmed = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * COMPUTED
 */
const title = computed((): string =>
  lockConfirmed.value
    ? t('getVeBAL.previewModal.titles.confirmed')
    : t('getVeBAL.previewModal.titles.default')
);

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

    <LockAmount :lockablePool="lockablePool" :lockAmount="lockAmount" />

    <LockSummary
      :lockablePool="lockablePool"
      :lockAmount="lockAmount"
      :lockedUntil="lockedUntil"
      :expectedVeBalAmount="expectedVeBalAmount"
    />

    <LockActions
      :lockablePool="lockablePool"
      :lockAmount="lockAmount"
      :lockedUntil="lockedUntil"
      :lockType="lockType"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
    />
  </BalModal>
</template>
