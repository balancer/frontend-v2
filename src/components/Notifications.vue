<template>
  <div
    class="fixed left-0 right-0 bottom-0 text-center"
    style="z-index: 99999;"
  >
    <div class="mb-5">
      <div v-for="(item, key) in items" :key="key" class="mb-2">
        <UiButton
          :class="`bg-${item.type}-500`"
          class="notification inline-block border-0"
          v-if="now < item.timestamp + duration && !item.hide"
          @click="item.hide = true"
        >
          {{ $t(item.message) }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script>
const DURATION = 4000;

export default {
  data() {
    return {
      now: Date.now(),
      duration: DURATION
    };
  },
  computed: {
    items() {
      return this.$store.state.notifications.items;
    }
  },
  mounted() {
    setInterval(() => (this.now = Date.now()), 1e3);
  }
};
</script>
