<script setup lang="ts">
import Index from '@/pages/Index.vue';

import { provideWeb3Plugin } from '@/providers/web3-plugin.provider';

provideWeb3Plugin();
</script>

<template>
  <Index></Index>
</template>

