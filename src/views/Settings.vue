<template>
  <Layout class="mt-4">
    <template v-slot:content-left>
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 v-text="$t('settings')" class="mb-4" />
        <div class="mb-4">
          <h3 v-text="$t('currentNetwork')" class="mb-2" />
          <p>{{ web3.network.name }}</p>
        </div>
        <div class="mb-4">
          <h3 v-text="$t('changeTheme')" class="mb-2" />
          <UiButton
            @click="setSkin('light')"
            v-text="$t('light')"
            class="mr-2"
          />
          <UiButton @click="setSkin('dark')" v-text="$t('dark')" class="mr-2" />
          <UiButton @click="setSkin('classic')" v-text="$t('classic')" />
        </div>
        <div class="mb-4">
          <h3 v-text="$t('language')" class="mb-2" />
          <UiButton
            v-for="(lang, i) in langs"
            :key="`Lang${i}`"
            @click="setLocale(lang)"
            class="mr-2"
          >
            {{ langMap[lang] }}
          </UiButton>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      modalOpen: false,
      pendingClaims: false,
      totalPending: false,
      langs: ['en-US', 'zh-CN', 'fr-FR'],
      langMap: { 'en-US': 'English', 'zh-CN': '中文', 'fr-FR': 'Français' }
    };
  },
  methods: {
    ...mapActions(['setSkin', 'setLocale'])
  }
};
</script>
