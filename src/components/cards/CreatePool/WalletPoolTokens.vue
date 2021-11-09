<script setup lang="ts">
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, defineComponent } from 'vue';

type Props = {
  tokens: string[];
};

const props = withDefaults(defineProps<Props>(), {
  tokens: [] as string[]
});

const { tokens: _tokens, nativeAsset, wrappedNativeAsset } = useTokens();
const nativeTokens = computed(() => [nativeAsset, wrappedNativeAsset.value]);
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b">
      <h6>Pool tokens in my wallet</h6>
    </div>
    <BalStack isDynamic vertical class="p-4" spacing='sm'>
      <div>
        <h6 class="branch relative">Native tokens</h6>
        <BalStack isDynamic vertical spacing='xs'>
          <BalStack
            class="ml-6 twig relative"
            v-for="token in nativeTokens"
            :key="`wallet-pool-token-${token}`"
            horizontal
            justify="between"
          >
            <BalStack vertical spacing="none">
              <h6>{{ token?.symbol || 'N/A' }}</h6>
              <span class="text-sm text-gray-600">{{
                token?.name || 'Unknown token'
              }}</span>
            </BalStack>
          </BalStack>
        </BalStack>
      </div>
      <BalStack
        v-for="token in tokens"
        :key="`wallet-pool-token-${token}`"
        horizontal
        justify="between"
      >
        <BalStack vertical spacing="none">
          <h6>{{ _tokens[token]?.symbol || 'N/A' }}</h6>
          <span class="text-sm text-gray-600">{{
            _tokens[token]?.name || 'Unknown token'
          }}</span>
        </BalStack>
      </BalStack>
    </BalStack>
  </BalCard>
</template>

<style scoped>
    .branch::after {
        content: '';
        position: absolute;
        height: 5.25rem;
        width: 1px;
        bottom: -5.25rem;
        left: 0.5rem;
        @apply bg-gray-300;
    }

    .twig::before {
        content: '';
        position: absolute;
        width: 1rem;
        height: .5px;
        top: 50%;
        left: -1rem;
        @apply bg-gray-300;
    }
</style>
