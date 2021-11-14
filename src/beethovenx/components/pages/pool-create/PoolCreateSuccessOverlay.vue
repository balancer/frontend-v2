<template>
  <div
    class="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-850 rounded-lg z-10 text-center"
  >
    <div class="flex flex-col justify-between items-center h-full p-4">
      <h3>Your investment pool has been created</h3>
      <div class="flex flex-col items-center">
        <div
          class="w-20 h-20 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-500 text-green-500 dark:text-gray-850 mb-8"
        >
          <BalIcon name="check-circle" size="xl" />
        </div>
        <p class="text-gray-300">
          Your investment pool has been successfully created and joined. You're
          good to go!
        </p>
      </div>
      <div class="grid grid-cols-1 gap-4 mt-4 w-full">
        <BalBtn @click="navigateToPool">
          <span>Take me to my pool</span>
        </BalBtn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PoolCreateSuccessOverlay',

  props: {
    poolId: { type: String, required: true }
  },

  setup(props) {
    const router = useRouter();

    function navigateToPool() {
      router.push({
        name: 'pool',
        params: {
          id: props.poolId
        }
      });
    }

    return {
      navigateToPool
    };
  }
});
</script>
