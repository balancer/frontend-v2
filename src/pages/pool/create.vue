<script setup lang="ts">
import { useRoute } from 'vue-router';
import ChooseWeights, {
  TokenWeight
} from '@/components/cards/CreatePool/ChooseWeights.vue';
import PoolSummary from '@/components/cards/CreatePool/PoolSummary.vue';
import WalletPoolTokens from '@/components/cards/CreatePool/WalletPoolTokens.vue';
import { ref, watch } from 'vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
const tokenWeights = ref<TokenWeight>();

watch(tokenWeights, () => {
  console.log('esh');
});

/**
 * STATE
 */

/**
 * QUERIES
 */

/**
 * COMPUTED
 */
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-x-8 pt-8 grid-container mx-auto">
    <div class="col-span-6 col-start-4">
      <ChooseWeights v-model:tokenWeights="tokenWeights" />
    </div>
    <div class="col-span-3">
      <BalStack vertical spacing="base">
        <PoolSummary :tokens="tokenWeights" />
        <WalletPoolTokens :tokens="tokenWeights" />
      </BalStack>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  max-width: 1100px;
}
</style>
