<script setup lang="ts">
import { computed, nextTick, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import WrapStEthLink from '@/components/contextual/pages/pool/invest/WrapStEthLink.vue';
import StakePreviewModal from '@/components/contextual/stake/StakePreviewModal.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { isStableLike, usePool, isDeep } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { LOW_LIQUIDITY_THRESHOLD } from '@/constants/poolLiquidity';
import {
  bnum,
  selectByAddress,
  indexOfAddress,
  isSameAddress,
  forChange,
} from '@/lib/utils';
import { isRequired } from '@/lib/utils/validations';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import InvestFormTotals from './components/InvestFormTotals.vue';
import InvestPreviewModal from './components/InvestPreviewModal/InvestPreviewModal.vue';
import useInvestMath from './composables/useInvestMath';
import useInvestState from './composables/useInvestState';
import { parseFixed } from '@ethersproject/bignumber';

import mockGeneralizedJoin from './mockGeneralizedJoin';
import useMyWallet from '@/composables/useMyWallet';

/**
 * TYPES
 */
enum NativeAsset {
  wrapped = 'wrapped',
  unwrapped = 'unwrapped',
}

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const showInvestPreview = ref(false);
const showStakeModal = ref(false);
const relayerAuthorization = ref<string>(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000001bc90329ed90439744b57601e9ae2d5525e8554ee14d40c84dc8ee89b01de129a35dfb25841fad7f887c025869bbf91496b39200ce19d55fede3f3e74bbe2ea91c'
);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { balanceFor, nativeAsset, wrappedNativeAsset, getToken } = useTokens();
const { useNativeAsset } = usePoolTransfers();
// const { networkConfig } = useConfig();
const {
  tokenAddresses,
  amounts,
  validInputs,
  highPriceImpactAccepted,
  resetAmounts,
  sor,
} = useInvestState();

const pool = computed(() => props.pool);

const investMath = useInvestMath(
  pool,
  tokenAddresses,
  amounts,
  useNativeAsset,
  sor
);

const {
  hasAmounts,
  highPriceImpact,
  maximizeAmounts,
  optimizeAmounts,
  proportionalAmounts,
  loadingData,
} = investMath;

const {
  isWalletReady,
  startConnectWithInjectedProvider,
  isMismatchedNetwork,
  getProvider,
} = useWeb3();

const {
  managedPoolWithTradingHalted,
  isWethPool,
  isStableLikePool,
  isDeepPool,
} = usePool(pool);

/**
 * COMPUTED
 */
const hasValidInputs = computed(
  (): boolean =>
    validInputs.value.every(validInput => validInput === true) &&
    hasAcceptedHighPriceImpact.value
);

const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const forceProportionalInputs = computed(
  (): boolean => managedPoolWithTradingHalted.value
);

const poolHasLowLiquidity = computed((): boolean =>
  bnum(props.pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)
);

const investmentTokens = computed((): string[] => {
  if (isDeep(props.pool)) {
    return poolTokensWithBalance.value || [];
  }
  return props.pool.tokensList;
});

const { poolTokensWithBalance } = useMyWallet({ pool: pool.value });

/**
 * METHODS
 */
function handleAmountChange(value: string, index: number): void {
  amounts.value[index] = value;

  nextTick(() => {
    if (forceProportionalInputs.value) {
      amounts.value = [...proportionalAmounts.value];
    }
  });
}

function handleAddressChange(newAddress: string): void {
  useNativeAsset.value = isSameAddress(newAddress, nativeAsset.address);
}

function tokenWeight(address: string): number {
  if (isStableLike(props.pool.poolType)) return 0;
  if (!props.pool?.onchain?.tokens) return 0;

  if (isSameAddress(address, nativeAsset.address)) {
    return (
      selectByAddress(
        props.pool.onchain.tokens,
        wrappedNativeAsset.value.address
      )?.weight || 1
    );
  }

  return selectByAddress(props.pool.onchain.tokens, address)?.weight || 1;
}

function propAmountFor(index: number): string {
  if (isStableLikePool.value) return '0.0';

  return bnum(proportionalAmounts.value[index]).gt(0)
    ? proportionalAmounts.value[index]
    : '0.0';
}

function hint(index: number): string {
  return bnum(propAmountFor(index)).gt(0) ? t('proportionalSuggestion') : '';
}

function tokenOptions(index: number): string[] {
  return isSameAddress(
    props.pool.tokensList[index],
    wrappedNativeAsset.value.address
  )
    ? [wrappedNativeAsset.value.address, nativeAsset.address]
    : [];
}

// If ETH has a higher balance than WETH then use it for the input.
function setNativeAssetByBalance(): void {
  const nativeAssetBalance = balanceFor(nativeAsset.address);
  const wrappedNativeAssetBalance = balanceFor(
    wrappedNativeAsset.value.address
  );

  if (bnum(nativeAssetBalance).gt(wrappedNativeAssetBalance)) {
    setNativeAsset(NativeAsset.unwrapped);
    useNativeAsset.value = true;
  }
}

function setNativeAsset(to: NativeAsset): void {
  const fromAddress =
    to === NativeAsset.wrapped
      ? nativeAsset.address
      : wrappedNativeAsset.value.address;
  const toAddress =
    to === NativeAsset.wrapped
      ? wrappedNativeAsset.value.address
      : nativeAsset.address;

  const indexOfAsset = indexOfAddress(tokenAddresses.value, fromAddress);

  if (indexOfAsset >= 0) {
    tokenAddresses.value[indexOfAsset] = toAddress;
  }
}

async function runGeneralisedJoin(amounts: string[]) {
  const signer = getProvider().getSigner();
  const signerAddress = await signer.getAddress();
  const wrapLeafTokens = false;
  const slippage = '100'; // 100 bps = 1%
  const poolId = pool.value.id;
  const amountsIn = tokenAddresses.value.map((tokenAddress, index) => {
    const amount = amounts[index] || '0';
    const token = getToken(tokenAddress);
    const amountIn = parseFixed(amount, token?.decimals ?? 18).toString();
    return amountIn;
  });

  console.log({
    poolId,
    tokenAddresses: tokenAddresses.value,
    amountsIn,
    signerAddress,
    wrapLeafTokens,
    slippage,
    signer,
    authorisation: relayerAuthorization.value,
  });

  const generalisedJoinQuery = await mockGeneralizedJoin(
    poolId,
    tokenAddresses.value,
    amountsIn,
    signerAddress,
    wrapLeafTokens,
    slippage,
    signer,
    relayerAuthorization.value
  );
  console.log({ generalisedJoinQuery });
}

/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  resetAmounts();
  await forChange(isWalletReady, true);
  tokenAddresses.value = [...investmentTokens.value];
  if (isWethPool.value) setNativeAssetByBalance();
});

onMounted(async () => {
  // const signer = getProvider().getSigner();
  // const signerAddress = await signer.getAddress();
  // const authorisation = await Relayer.signRelayerApproval(
  //   networkConfig.addresses.batchRelayer,
  //   signerAddress,
  //   signer,
  //   Vault__factory.connect(networkConfig.addresses.vault, signer)
  // );
  // relayerAuthorization.value = authorisation;
});

/**
 * WATCHERS
 */
watch(useNativeAsset, shouldUseNativeAsset => {
  if (shouldUseNativeAsset) {
    setNativeAsset(NativeAsset.unwrapped);
  } else {
    setNativeAsset(NativeAsset.wrapped);
  }
});

watch(
  () => amounts,
  val => {
    if (val.value) {
      runGeneralisedJoin(val.value);
    }
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div>
    <BalAlert
      v-if="forceProportionalInputs"
      type="warning"
      :title="$t('investment.warning.managedPoolTradingHalted.title')"
      :description="
        $t('investment.warning.managedPoolTradingHalted.description')
      "
      class="mb-4"
    />

    <BalAlert
      v-if="poolHasLowLiquidity"
      type="warning"
      :title="$t('investment.warning.lowLiquidity.title')"
      :description="$t('investment.warning.lowLiquidity.description')"
      class="mb-4"
    />

    <TokenInput
      v-for="(n, i) in tokenAddresses"
      :key="n"
      v-model:address="tokenAddresses[i]"
      v-model:amount="amounts[i]"
      v-model:isValid="validInputs[i]"
      :name="tokenAddresses[i]"
      :weight="tokenWeight(tokenAddresses[i])"
      :hintAmount="propAmountFor(i)"
      :hint="hint(i)"
      class="mb-4"
      fixedToken
      :options="tokenOptions(i)"
      @update:amount="handleAmountChange($event, i)"
      @update:address="handleAddressChange($event)"
    />

    <InvestFormTotals
      :math="investMath"
      :showTotalRow="!isDeepPool"
      @maximize="maximizeAmounts"
      @optimize="optimizeAmounts"
    />

    <div
      v-if="highPriceImpact"
      class="p-2 pb-2 mt-4 rounded-lg border dark:border-gray-700"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        :rules="[isRequired($t('priceImpactCheckbox'))]"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('priceImpactAccept', [$t('depositing')])"
      />
    </div>

    <WrapStEthLink :pool="pool" class="mt-4" />

    <div class="mt-4">
      <BalBtn
        v-if="!isWalletReady"
        :label="$t('connectWallet')"
        color="gradient"
        block
        @click="startConnectWithInjectedProvider"
      />
      <BalBtn
        v-else
        :label="$t('preview')"
        color="gradient"
        :disabled="
          !hasAmounts || !hasValidInputs || isMismatchedNetwork || loadingData
        "
        block
        @click="showInvestPreview = true"
      />
    </div>

    <StakingProvider :poolAddress="pool.address">
      <teleport to="#modal">
        <InvestPreviewModal
          v-if="showInvestPreview"
          :pool="pool"
          :math="investMath"
          :tokenAddresses="tokenAddresses"
          @close="showInvestPreview = false"
          @show-stake-modal="showStakeModal = true"
        />
        <StakePreviewModal
          :pool="pool"
          :isVisible="showStakeModal"
          action="stake"
          @close="showStakeModal = false"
        />
      </teleport>
    </StakingProvider>
  </div>
</template>
