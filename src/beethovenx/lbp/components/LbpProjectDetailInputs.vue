<script setup lang="ts">
import useLgeCreateState from '@/beethovenx/lbp/composables/useLgeCreateState';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';

const { data } = useLgeCreateState();
</script>

<template>
  <div class="lbp-input-row">
    <BalTextInput title="Project Name*" v-model="data.name" type="text" />
    <BalTextInput
      title="Project Website URL*"
      v-model="data.websiteUrl"
      type="text"
    />
  </div>
  <div class="lbp-input-row">
    <BalTextInput
      title="Token Contract Address*"
      v-model="data.tokenContractAddress"
      type="text"
    />
    <BalTextInput
      title="Token Icon URL*"
      v-model="data.tokenIconUrl"
      type="text"
    />
  </div>
  <div class="lbp-input-row">
    <BalTextInput title="Twitter URL" v-model="data.twitterUrl" type="text" />
    <BalTextInput title="Medium URL" v-model="data.mediumUrl" type="text" />
  </div>
  <div class="lbp-input-row">
    <BalTextInput title="Discord URL" v-model="data.discordUrl" type="text" />
    <BalTextInput title="Telegram URL" v-model="data.telegramUrl" type="text" />
  </div>
  <div class="mb-8">
    <BalTextInput
      title="Banner Image URL"
      v-model="data.bannerImageUrl"
      tooltip="Optionally provide a banner image that will appear on your auction page."
      type="text"
    />
  </div>
  <div>
    <BalTextInput
      title="Project Description*"
      v-model="data.description"
      type="textarea"
    />
  </div>
</template>

<style scoped>
.lbp-input-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8;
}
</style>
