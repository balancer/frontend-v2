<template>
  <div class="fixed z-50 left-0 right-0 bottom-0 text-center">
    <div class="mb-5">
      <div v-for="(item, key) in items" :key="key" class="mb-2">
        <div
          :class="{
            'bg-green-500': item.type === 'green',
            'bg-red-500': item.type === 'red'
          }"
          class="notification inline-block px-4 py-2 rounded-full text-base border-0"
          v-if="now < item.timestamp + duration && !item.hide"
          @click="item.hide = true"
        >
          {{ $t(item.message) }}
        </div>
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
