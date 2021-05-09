<template>
  <div class="app-nav-toggle">
    <router-link
      :to="{ name: 'home' }"
      :class="['toggle-link pl-6 pr-4', { [activeClasses]: !isTradePage }]"
      @click="trackGoal(Goals.ClickNavInvest)"
    >
      {{ $t('invest') }}
    </router-link>
    <router-link
      :to="{ name: 'trade' }"
      :class="['toggle-link pl-4 pr-6', { [activeClasses]: isTradePage }]"
      @click="trackGoal(Goals.ClickNavTrade)"
    >
      {{ $t('trade') }}
    </router-link>
  </div>
</template>

<script lang="ts">
import useFathom from '@/composables/useFathom';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AppNavToggle',

  setup() {
    const route = useRoute();
    const activeClasses = 'bg-black text-white';
    const isTradePage = computed(() => route.name === 'trade');
    const { trackGoal, Goals } = useFathom();

    return {
      isTradePage,
      activeClasses,
      trackGoal,
      Goals
    };
  }
});
</script>

<style scoped>
.app-nav-toggle {
  @apply h-10 border rounded-full flex items-center font-medium shadow overflow-hidden;
}

.toggle-link {
  @apply h-full flex items-center;
}
</style>
