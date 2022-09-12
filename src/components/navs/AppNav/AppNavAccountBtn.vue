<script setup lang="ts">
import { computed } from 'vue';

import Avatar from '@/components/images/Avatar.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import { shorten } from '@/lib/utils';

import AppNavSettings from './AppNavSettings.vue';

const { bp, upToLargeBreakpoint, isMobile } = useBreakpoints();
const { isLoadingProfile, profile, account } = useWeb3();

const avatarSize = computed(() => {
  if (bp.value === 'sm') {
    return 35;
  } else if (['md', 'lg'].includes(bp.value)) {
    return 40;
  } else {
    return 20;
  }
});
</script>

<template>
  <BalPopover
    noPad
    :align="isMobile ? 'center' : undefined"
    :detached="isMobile ? true : undefined"
  >
    <template #activator>
      <BalBtn
        class="text-base"
        :class="{ btn: upToLargeBreakpoint }"
        :loading="isLoadingProfile"
        :loadingLabel="upToLargeBreakpoint ? '' : $t('connecting')"
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <Avatar
          :iconURI="profile?.avatar || ''"
          :address="account"
          :size="avatarSize"
        />
        <span
          v-if="profile && profile.ens"
          class="hidden lg:inline-block pl-2"
          v-text="profile && profile.ens"
        />
        <span
          v-else
          class="hidden lg:inline-block pl-2 eth-address"
          v-text="shorten(account)"
        />
      </BalBtn>
    </template>
    <AppNavSettings />
  </BalPopover>
</template>


