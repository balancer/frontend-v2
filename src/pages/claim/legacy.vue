<script lang="ts" setup>
import HeroClaim from '@/components/contextual/pages/claim/HeroClaim.vue';
import LegacyClaims from '@/components/contextual/pages/claim/LegacyClaims.vue';
import { MerkleOrchardVersion } from '@/services/claim/claim.service';
import useWeb3 from '@/services/web3/useWeb3';
import {
  isArbitrum,
  isMainnet,
  isGoerli,
  isPolygon,
} from '@/composables/useNetwork';

/**
 * COMPOSABLES
 */
const { isWalletReady, account } = useWeb3();

/**
 * COMPUTED
 */
const legacyClaimUI = computed(() => {
  if (isMainnet.value) {
    return [
      { token: '$BAL', subdomain: 'claim' },
      { token: '$VITA', subdomain: 'claim-vita' },
      { token: '$LDO', subdomain: 'claim-lido' },
    ];
  } else if (isArbitrum.value) {
    return [
      { token: '$BAL', subdomain: 'claim-arbitrum' },
      { token: '$MCDEX', subdomain: 'claim-mcdex' },
      { token: '$PICKLE', subdomain: 'claim-pickle' },
    ];
  }

  return [];
});
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

          <h3 class="mt-8 font-body text-lg font-semibold">
            Merkle Orchard V1
          </h3>
          <LegacyClaims
            :merkleOrchardVersion="MerkleOrchardVersion.V1"
            class="mt-2"
          />

          <h3 class="mt-8 font-body text-lg font-semibold">
            Merkle Orchard V2
          </h3>
          <LegacyClaims
            :merkleOrchardVersion="MerkleOrchardVersion.V2"
            class="mt-2"
          />

          <div class="mb-4">
            <div class="mb-2 font-semibold">
              Looking for other claimable tokens?
            </div>
            <ul class="pl-8 list-disc">
              <li v-if="legacyClaimUI.length > 0" class="mt-2">
                Claim
                <span class="inline-grid grid-flow-col gap-1">
                  <BalLink
                    v-for="legacyClaim in legacyClaimUI"
                    :key="`token-${legacyClaim.token}`"
                    :href="`https://${legacyClaim.subdomain}.balancer.fi/#/${account}`"
                    external
                    >{{ legacyClaim.token }}</BalLink
                  >
                </span>
                from legacy liquidity mining contracts distributed before 20
                Oct, 2021.
              </li>
              <li class="mt-2">
                Claim BAL on other networks
                <template v-if="isArbitrum">
                  <BalLink
                    href="https://app.balancer.fi/#/ethereum/claim/legacy"
                    external
                  >
                    Ethereum
                  </BalLink>
                  and
                  <BalLink
                    href="https://app.balancer.fi/#/polygon/claim/legacy"
                    external
                  >
                    Polygon </BalLink
                  >.
                </template>
                <template v-else-if="isPolygon">
                  <BalLink
                    href="https://app.balancer.fi/#/ethereum/claim/legacy"
                    external
                  >
                    Ethereum
                  </BalLink>
                  and
                  <BalLink
                    href="https://app.balancer.fi/#/arbitrum/claim/legacy"
                    external
                  >
                    Arbitrum </BalLink
                  >.
                </template>
                <template v-else-if="isMainnet || isGoerli">
                  <BalLink
                    href="https://app.balancer.fi/#/polygon/claim/legacy"
                    external
                  >
                    Polygon
                  </BalLink>
                  and
                  <BalLink
                    href="https://app.balancer.fi/#/arbitrum/claim/legacy"
                    external
                  >
                    Arbitrum </BalLink
                  >.
                </template>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
