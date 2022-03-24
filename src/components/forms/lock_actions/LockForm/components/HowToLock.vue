<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * COMPUTED
 */
const steps = computed(() => [
  t('getVeBAL.howToLock.steps.lock', [props.lockablePoolTokenInfo.symbol]),
  t('getVeBAL.howToLock.earn.boost'),
  t('getVeBAL.howToLock.earn.voting')
]);
</script>

<template>
  <BalCard noPad shadow="none" class="mt-4">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.howToLock.title') }}
      </h6>
    </div>
    <div class="-mt-2 p-4">
      <div class="text-gray-500">
        <ol class="steps text-sm">
          <li>
            {{ $t('getVeBAL.howToLock.steps.investPart1') }}
            <BalLink
              tag="router-link"
              :to="{ name: 'invest', params: { id: lockablePool.id } }"
              external
            >
              {{ lockablePoolTokenInfo.symbol }}
            </BalLink>
            {{ $t('getVeBAL.howToLock.steps.investPart2') }}
          </li>
          <li v-for="(step, i) in steps" :key="i" v-html="step" />
        </ol>
      </div>
    </div>
  </BalCard>
</template>
<style scoped>
.steps {
  @apply list-decimal px-4;
}

.steps li {
  @apply pb-2;
}
</style>
