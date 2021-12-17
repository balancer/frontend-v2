<script setup lang="ts">
import { useRouter } from 'vue-router';
import LgeTable from '@/beethovenx/lbp/components/LgeTable.vue';

const router = useRouter();

function goToLaunchCreate() {
  router.push({ name: 'lge-create' });
}
</script>
<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="flex mb-3 items-center">
      <div class="flex-1">
        <img src="~@/beethovenx/assets/images/auctions.svg" class="-ml-4" />
      </div>
      <BalBtn
        class="hidden lg:block"
        label="Create a LGE"
        @click="goToLaunchCreate"
      />
    </div>
    <div class="mb-32">
      <LgeTable />
    </div>
  </div>
</template>
