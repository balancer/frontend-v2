<template>
  <div class="absolute left-0 bottom-0 right-0 flex justify-center p-16">
    <BalLink
      v-for="link in footerLinks"
      :href="link[1]"
      :key="link[0]"
      external
    >
      <div class="flex items-center mr-4 text-gray-500 hover:text-blue-500 font-medium">
        <span>{{ link[0] }}</span>
        <BalIcon name="arrow-up-right" size="sm" class="text-gray-300" />
      </div>
    </BalLink>
  </div>
</template>

<script lang="ts">
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const { account } = useWeb3();
    const { t } = useI18n();
    const footerLinks = computed(() => [
      [t('vote'), EXTERNAL_LINKS.Balancer.Vote],
      [t('claim'), EXTERNAL_LINKS.Balancer.Claim(account.value || '')],
      [t('chat'), EXTERNAL_LINKS.Balancer.Chat],
      [t('blog'), EXTERNAL_LINKS.Balancer.Blog],
      [t('docs'), EXTERNAL_LINKS.Balancer.Docs],
      [t('analytics'), EXTERNAL_LINKS.Balancer.Dune],
      [t('liquidityMining'), EXTERNAL_LINKS.Balancer.LiquidityMining]
    ]);

    return {
      footerLinks
    };
  }
});
</script>
