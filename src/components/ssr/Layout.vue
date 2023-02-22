<script setup lang="ts">
import Footer from '@/components/footer/Footer.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import Link from './Link.vue';

import { useClientLogic } from '@pages/_default/useClientLogic';

const { isWeb3PluginLoaded } = useClientLogic();

const modeLinks = [
  {
    url: '/',
    name: 'INDEX',
  },
  {
    url: '/ssr',
    name: 'SSR',
  },
  {
    url: '/spa',
    name: 'SPA',
  },
  {
    url: '/characters',
    name: 'Vue-query',
  },
];
</script>

<template>
  <div class="app-body">
    <div class="links">
      <span style="font-weight: normal">Demo modes:</span>
      <Link v-for="link in modeLinks" :key="link.name" :href="link.url">{{
        link.name
      }}</Link>
    </div>
  </div>
  <div>
    <div class="app-body">
      <!-- <AppNav v-if="isWeb3PluginLoaded"> </AppNav> -->
      <!-- <div v-else>Client logic loading...</div> -->
      <slot></slot>
    </div>
  </div>
  <Footer />
</template>

<style>
h1 {
  font-size: 2em;
  text-align: center;
}

.links {
  margin-top: 32px;
  margin-left: -32px;
  margin-right: -32px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-top: 1px solid hsl(0deg 0% 95%);
  border-bottom: 1px solid hsl(0deg 0% 95%);
  text-align: center;
}

.links * {
  position: relative;
  margin-left: 8px;
  margin-right: 8px;
  color: hsl(0deg 0% 50%);
  font-weight: bold;
  font-size: 0.9em;
}

.links a:hover,
.links a.active {
  color: hsl(0deg 0% 20%);
}

.links a.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: currentcolor;
}
</style>
