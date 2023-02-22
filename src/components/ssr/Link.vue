<script setup lang="ts">
import { inject } from 'vue';

import { PageContextBuiltIn } from 'vite-plugin-ssr';
const pageContext = inject('pageContext') as PageContextBuiltIn;
</script>

<template>
  <a :class="{ active: pageContext.urlParsed.pathname === $attrs.href }">
    <slot></slot>
  </a>
</template>
