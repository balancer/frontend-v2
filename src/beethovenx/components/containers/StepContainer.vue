<template>
  <BalCard class="mb-4">
    <div class="step-card-container">
      <div
        :class="['step-card-step', complete ? 'bg-green-500 border-black' : '']"
      >
        <span :class="[complete ? 'text-black' : 'text-gray-400']"
          >{{ stepNumber }}
        </span>
      </div>
      <div class="ml-3 flex-1">
        <span>{{ title }}</span>
      </div>
      <div v-if="$slots.right" class="ml-4">
        <slot name="right" />
      </div>
    </div>
    <div v-if="$slots.content" class="mt-6 relative">
      <slot name="content" />
    </div>
  </BalCard>
</template>

<script lang="ts">
import useNumbers from '@/composables/useNumbers';
import anime from 'animejs';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';
import BalCard from '@/components/_global/BalCard/BalCard.vue';

export default {
  name: 'StepContainer',

  components: { BalCard },

  props: {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    complete: { type: Boolean, required: true }
  },

  setup(props) {
    /**
     * COMPOSABLES
     */
    const { fNum } = useNumbers();

    const animateRef = ref();
    const { balances, prices } = useTokens();
    const { currency } = useUserSettings();

    /**
     * COMPUTED
     */
    const balance = computed(() => Number(balances.value[props.token.address]));
    const price = computed(() =>
      prices.value[props.token.address]
        ? prices.value[props.token.address][currency.value]
        : 0
    );
    const value = computed(() => balance.value * price.value);

    /**
     * CALLBACKS
     */
    onMounted(() => {
      anime({
        opacity: 1,
        targets: animateRef.value,
        delay: anime.stagger(100)
      });
    });

    onUnmounted(() => {
      anime({
        opacity: 0,
        targets: animateRef.value
      });
    });

    return {
      fNum,
      animateRef,
      balance,
      value
    };
  }
};
</script>
<style scoped>
.step-card-container {
  @apply flex items-center;
}
.step-card-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>
