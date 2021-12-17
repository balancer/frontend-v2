<script setup lang="ts">
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import useTokens from '@/composables/useTokens';
import { computed } from 'vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';

const { data } = useLgeCreateState();
const { getToken } = useTokens();

const launchToken = computed(() => getToken(data.value.tokenContractAddress));
</script>

<template>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Project Name</div>
      <div class="text-xl">{{ data.name }}</div>
    </div>
    <div>
      <div class="text-gray-500">Project Website</div>
      <a :href="data.websiteUrl" class="text-green-400 text-xl" target="_blank">
        {{ data.websiteUrl }}
      </a>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Token</div>
      <div class="text-xl items-center flex">
        {{ launchToken.name }} ({{ launchToken.symbol }})&nbsp;
        <BalAsset :address="launchToken.address" :iconURI="data.tokenIconUrl" />
      </div>
    </div>
    <div>
      <div class="text-gray-500">Token Contract Address</div>
      <div class="text-xl">{{ launchToken.address }}</div>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Twitter URL</div>
      <a
        v-if="data.twitterUrl"
        :href="data.twitterUrl"
        class="text-green-400 text-xl"
        target="_blank"
      >
        {{ data.twitterUrl }}
      </a>
      <div v-else class="text-xl">n/a</div>
    </div>
    <div>
      <div class="text-gray-500">Medium URL</div>
      <a
        v-if="data.mediumUrl"
        :href="data.mediumUrl"
        class="text-green-400 text-xl"
        target="_blank"
      >
        {{ data.mediumUrl }}
      </a>
      <div v-else class="text-xl">n/a</div>
    </div>
  </div>
  <div class="lbp-review-row">
    <div>
      <div class="text-gray-500">Discord URL</div>
      <a
        v-if="data.discordUrl"
        :href="data.discordUrl"
        class="text-green-400 text-xl"
        target="_blank"
      >
        {{ data.discordUrl }}
      </a>
      <div v-else class="text-xl">n/a</div>
    </div>
    <div>
      <div class="text-gray-500">Telegram URL</div>
      <a
        v-if="data.telegramUrl"
        :href="data.telegramUrl"
        class="text-green-400 text-xl"
        target="_blank"
      >
        {{ data.telegramUrl }}
      </a>
      <div v-else class="text-xl">n/a</div>
    </div>
  </div>
  <div class="mb-4" v-if="data.bannerImageUrl">
    <div class="text-gray-500">Banner Image</div>
    <img :src="data.bannerImageUrl" width="400" class="max-w-full" />
  </div>
  <div class="mb-4">
    <div class="text-gray-500">Project Description</div>
    <div class="whitespace-pre-line">{{ data.description }}</div>
  </div>
</template>

<style scoped>
.lbp-review-row {
  @apply grid grid-cols-2 md:grid-cols-2 gap-y-8 gap-x-4 mb-4;
}
</style>
