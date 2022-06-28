<template>
  <footer>
    <div class="lg:container lg:mx-auto dark:border-t dark:border-gray-800">
      <div
        class="
          px-4
          lg:px-0
          py-12          
          flex
          flex-col
          md:flex-row
          md:justify-between
          gap-8
          text-white 
        "
      >
        <div class="flex flex-col gap-8">
          <router-link class="link font-medium" :to="{ name: 'home' }">
            <logotype-balancer class="mb-4" />
          </router-link>

          <div class="md:hidden flex flex-col gap-2">
            <p>
              <router-link class="link font-medium" :to="{ name: 'home' }">
                {{ $t('invest') }}
              </router-link>
            </p>
            <p>
              <router-link class="link font-medium" :to="{ name: 'trade' }">
                {{ $t('trade') }}
              </router-link>
            </p>
            <p>
              <router-link class="link font-medium" :to="{ name: 'portfolio' }">
                {{ $t('portfolio') }}
              </router-link>
            </p>
            <p>
              <router-link class="link font-medium" :to="{ name: 'vebal' }">
                {{ $t('vebal') }}
              </router-link>
            </p>
            <p>
              <router-link class="link font-medium" :to="{ name: 'claim' }">
                {{ $t('claim') }}
              </router-link>
            </p>
          </div>

          <div
            class="flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 md:order-3"
          >
            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Home"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('about') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>

            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Docs"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('docs') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>

            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Forum"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('forum') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>

            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Vote"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('vote') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>

            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Grants"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('grants') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>

            <BalLink
              :href="EXTERNAL_LINKS.Balancer.BugBounty"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('bugBounty') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>

            <BalLink
              :href="EXTERNAL_LINKS.Balancer.Analytics"
              external
              noStyle
              class="link link--external group"
            >
              {{ $t('analytics') }}
              <BalIcon name="arrow-up-right" size="sm" class="arrow" />
            </BalLink>
          </div>
        </div>
        <div class="flex flex-col gap-8">
          <div class="md:order-2">
            <div class="flex lg:flex-col md:justify-end">
              <div class="flex gap-3 md:justify-end">
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Twitter"
                  external
                  noStyle
                >
                  <icon-twitter />
                </BalLink>
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Discord"
                  external
                  noStyle
                >
                  <icon-discord />
                </BalLink>
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Medium"
                  external
                  noStyle
                >
                  <icon-medium />
                </BalLink>
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Youtube"
                  external
                  noStyle
                >
                  <icon-youtube />
                </BalLink>
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Github"
                  external
                  noStyle
                >
                  <icon-github />
                </BalLink>
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Linkedin"
                  external
                  noStyle
                >
                  <icon-linkedin />
                </BalLink>
                <BalLink
                  :href="EXTERNAL_LINKS.Balancer.Social.Mail"
                  external
                  noStyle
                >
                  <icon-mail />
                </BalLink>
              </div>
            </div>
          </div>

          <div
            class="flex flex-wrap gap-x-3 lg:gap-x-4 gap-y-2 md:order-3 md:justify-end"
          >
            <p>
              <router-link class="policy" :to="{ name: 'terms-of-use' }">
                {{ $t('policies.termsOfUse') }}
              </router-link>
            </p>
            <p>
              <router-link class="policy" :to="{ name: 'privacy-policy' }">
                {{ $t('policies.privacyPolicy') }}
              </router-link>
            </p>
            <p>
              <router-link class="policy" :to="{ name: 'cookies-policy' }">
                {{ $t('policies.cookiesPolicy') }}
              </router-link>
            </p>
            <p>
              <a
                @click="isThirdPartyServicesModalVisible = true"
                class="policy"
                >{{ $t('policies.thirdPartyServices') }}</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { useI18n } from 'vue-i18n';

import { isThirdPartyServicesModalVisible } from '@/App.vue';
import IconDiscord from '@/components/icons/IconDiscord.vue';
import IconGithub from '@/components/icons/IconGithub.vue';
import IconLinkedin from '@/components/icons/IconLinkedin.vue';
import IconMail from '@/components/icons/IconMail.vue';
import IconMedium from '@/components/icons/IconMedium.vue';
import IconTwitter from '@/components/icons/IconTwitter.vue';
import IconYoutube from '@/components/icons/IconYoutube.vue';
import LogotypeBalancer from '@/components/icons/LogotypeBalancer.vue';
import { EXTERNAL_LINKS } from '@/constants/links';

export default {
  setup() {
    const { t } = useI18n();
    return {
      EXTERNAL_LINKS,
      t,
      isThirdPartyServicesModalVisible
    };
  },
  components: {
    IconTwitter,
    IconDiscord,
    IconMedium,
    IconYoutube,
    IconGithub,
    IconMail,
    IconLinkedin,
    LogotypeBalancer
  }
};
</script>

<style scoped>
footer {
  @apply bg-gray-50 dark:bg-gray-900;
}

footer :deep(.logotype) {
  @apply origin-top-left;
  transform: scale(1.5);
}

.link {
  @apply text-black dark:text-white transition-colors flex items-center no-underline hover:text-blue-600;
}

.link--external {
  @apply text-sm;
}

.link:hover,
.link:focus-visible {
  @apply text-blue-600 dark:text-yellow-500 no-underline;
}

.link:focus:not(:focus-visible) {
  outline: none;
}

.policy {
  @apply text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-yellow-500;
}

.arrow {
  @apply text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-yellow-500;
}

.router-link-active,
.dark .router-link-active {
  @apply text-red-500;
}
</style>
