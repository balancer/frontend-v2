<script lang="ts" setup>
import HeroClaim from '@/components/contextual/pages/claim/HeroClaim.vue';
import LegacyClaims from '@/components/contextual/pages/claim/LegacyClaims.vue';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * COMPOSABLES
 */
const { isWalletReady } = useWeb3();
</script>

<template>
  <div>
    <HeroClaim
      :title="$t('claimHero.legacyTitle')"
      :description="$t('claimHero.legacyDescription')"
    />
    <div class="xl:container py-12 xl:px-4 xl:mx-auto">
      <template v-if="isWalletReady">
        <div class="px-4 xl:px-0">
          <h2 :class="['font-body font-semibold text-2xl']">
            {{ $t('pages.claim.titles.legacyIncentives') }}
          </h2>
          <LegacyClaims />
        </div>
      </template>
    </div>
  </div>
</template>
