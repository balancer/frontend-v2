<script setup lang="ts">
import { reactive } from 'vue';
const state = reactive({ count: 0 });
</script>

<template>
  <div>
    <button
      type="button"
      class="py-2 px-4 font-bold text-white bg-blue-500 hover:bg-blue-700 rounded border border-blue-700"
      @click="state.count++"
    >
      Counter with tailwind {{ state.count }}
    </button>
    <br />
  </div>
</template>


