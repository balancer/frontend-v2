<script lang="ts" setup>
import { extractPrefetchAssets } from '@/lib/utils/prefetch';
import { RouteTo, resolveRoute } from '@/plugins/router/route-resolver';

interface Props {
  to: unknown;
}

const props = defineProps<Props>();

// This only works in production builds (use npm run build & npm run preview to test this feature)
// More details: https://github.com/vitejs/vite/issues/10600
const stringifiedAssets = resolveRoute(props.to as RouteTo)?.toString();

const assets = extractPrefetchAssets(stringifiedAssets);

function assetType(asset: string) {
  return asset.endsWith('.css') ? 'style' : 'script';
}
</script>

<template>
  <link
    v-for="asset in assets"
    :key="asset"
    rel="prefetch"
    :href="asset"
    :as="assetType(asset)"
  />
</template>