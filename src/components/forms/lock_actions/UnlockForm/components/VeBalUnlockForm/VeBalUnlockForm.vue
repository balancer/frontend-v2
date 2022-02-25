<script setup lang="ts">
import { computed, ref } from 'vue';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import UnlockPreviewModal from '../UnlockPreviewModal/UnlockPreviewModal.vue';

import { TokenInfo } from '@/types/TokenList';

import LockedAmount from './components/LockedAmount.vue';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const showPreviewModal = ref(false);

/**
 * COMPOSABLES
 */
const {
  isWalletReady,
  toggleWalletSelectModal,
  isMismatchedNetwork
} = useWeb3();

/**
 * COMPUTED
 */
const totalLpTokens = computed(() =>
  props.veBalLockInfo?.isExpired ? props.veBalLockInfo.lockedAmount : '0'
);

const fiatTotalLpTokens = computed(() =>
  bnum(props.lockablePool.totalLiquidity)
    .div(props.lockablePool.totalShares)
    .times(totalLpTokens.value)
);

const submissionDisabled = computed(() => {
  if (isMismatchedNetwork.value) {
    return true;
  }

  return bnum(totalLpTokens.value).isZero();
});
</script>

<template>
  <BalCard shadow="xl" exposeOverflow noBorder>
    <template #header>
      <div class="w-full">
        <div class="text-xs text-gray-500 leading-none">
          {{ configService.network.chainName }}
        </div>
        <div class="flex items-center justify-between">
          <h4>
            {{ $t('unlockVeBAL.unlockForm.title') }}
          </h4>
        </div>
      </div>
    </template>

    <LockedAmount
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :totalLpTokens="totalLpTokens"
      :fiatTotalLpTokens="fiatTotalLpTokens"
    />

    <div class="mt-6">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="toggleWalletSelectModal"
      />
      <BalBtn
        v-else
        color="gradient"
        block
        :disabled="submissionDisabled"
        @click="showPreviewModal = true"
      >
        {{ $t('preview') }}
      </BalBtn>
    </div>
  </BalCard>
  <teleport to="#modal">
    <UnlockPreviewModal
      v-if="showPreviewModal"
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
      :totalLpTokens="totalLpTokens"
      :fiatTotalLpTokens="fiatTotalLpTokens"
      @close="showPreviewModal = false"
    />
  </teleport>
</template>
