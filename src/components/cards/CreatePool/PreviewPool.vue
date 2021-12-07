<script lang="ts" setup>
import { ref, computed, onBeforeMount, onMounted } from 'vue';
import CreateActions from '@/components/cards/CreatePool/CreateActions.vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/services/web3/useWeb3';
import { shortenLabel } from '@/lib/utils';

/**
 * PROPS & EMITS
 */
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

/**
 * STATE
 */

const poolCreated = ref(false);

/**
 * COMPOSABLES
 */
const {
  seedTokens,
  poolLiquidity,
  getScaledAmounts,
  poolTypeString,
  initialFee,
  goBack,
  name: poolName,
  symbol: poolSymbol,
  setActiveStep,
  useNativeAsset,
  sortSeedTokens,
  feeManagementType,
  feeController,
  thirdPartyFeeController
} = usePoolCreation();

const { tokens, priceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum } = useNumbers();
const { t } = useI18n();
const { userNetworkConfig, account } = useWeb3();

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  sortSeedTokens();
});

/**
 * COMPUTED
 */

const title = computed((): string =>
  poolCreated.value
    ? t('poolCreated')
    : t('previewPool', [poolTypeString.value])
);

const initialWeightLabel = computed(() => t('initialWeight'));

const tokenAddresses = computed((): string[] => {
  return seedTokens.value.map(token => {
    if (
      token.tokenAddress == wrappedNativeAsset.value.address &&
      useNativeAsset.value
    ) {
      return nativeAsset.address;
    }
    return token.tokenAddress;
  });
});

const tokenAmounts = computed((): string[] => {
  return getScaledAmounts();
});

/**
 * LIFECYCLE
 */
onMounted(() => {
  // upon reaching this step. save the state of pool creation
  // as all the editable inputs have been set
  // saveState();
});

/**
 * METHODS
 */
function handleSuccess(): void {
  poolCreated.value = true;
  emit('success');
}

function getInitialWeight(tokenAddress: string, tokenAmount: number) {
  return fNum(
    (tokenAmount * priceFor(tokenAddress)) / poolLiquidity.value,
    'percent'
  );
}

function navigateToPoolFee() {
  setActiveStep(1);
}

function getSwapFeeManager() {
  if (feeManagementType.value === 'governance') {
    return t('balancerGovernance');
  } else {
    if (feeController.value === 'self') {
      return `${t('myWallet')}: ${shortenLabel(account.value)}`;
    } else {
      return shortenLabel(thirdPartyFeeController.value);
    }
  }
}
</script>

<template>
  <BalCard>
    <BalStack vertical spacing="xs">
      <span class="text-xs text-gray-700 dark:text-gray-500">{{
        userNetworkConfig?.name
      }}</span>
    </BalStack>
    <BalStack vertical>
      <div class="flex items-center">
        <BalCircle
          v-if="poolCreated"
          size="8"
          color="green"
          class="text-white mr-2"
        >
          <BalIcon name="check" />
        </BalCircle>
        <BalStack horizontal align="center" spacing="xs">
          <button
            @click="goBack"
            class="text-blue-500 hover:text-blue-700 flex"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>

          <h5 class="font-bold dark:text-gray-300">{{ title }}</h5>
        </BalStack>
      </div>
      <BalCard shadow="none" noPad>
        <div class="bg-gray-50 dark:bg-gray-700 p-2">
          <h6 class="text-sm">
            {{ $t('createAPool.tokensAndSeedLiquidity') }}
          </h6>
        </div>
        <BalStack vertical spacing="none" withBorder isDynamic>
          <div
            v-for="token in seedTokens"
            :key="`tokenpreview-${token.tokenAddress}`"
            class="p-4"
          >
            <BalStack horizontal justify="between">
              <BalStack horizontal align="center">
                <BalAsset :address="token.tokenAddress" :size="36" />
                <BalStack vertical spacing="none">
                  <span class="font-semibold">
                    {{ fNum(token.weight / 100, 'percent') }}
                    {{ tokens[token.tokenAddress].symbol }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ initialWeightLabel }}:
                    {{ getInitialWeight(token.tokenAddress, token.amount) }}
                  </span>
                </BalStack>
              </BalStack>
              <BalStack vertical spacing="none" align="end">
                <span class="font-semibold">
                  {{ fNum(token.amount, 'token') }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ fNum(token.amount * priceFor(token.tokenAddress), 'usd') }}
                </span>
              </BalStack>
            </BalStack>
          </div>
        </BalStack>
        <BalStack
          horizontal
          justify="between"
          class="p-4 border-t dark:border-gray-600"
        >
          <h6>{{ $t('total') }}</h6>
          <h6>{{ fNum(poolLiquidity, 'usd') }}</h6>
        </BalStack>
      </BalCard>
      <BalCard shadow="none" noPad>
        <div class="bg-gray-50 dark:bg-gray-700 p-2">
          <h6 class="text-sm">{{ $t('summary') }}</h6>
        </div>
        <BalStack vertical spacing="xs" class="p-3">
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('poolSymbol') }}:</span>
            <BalInlineInput size="xs" v-model="poolName" inputAlignRight />
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('poolName') }}:</span>
            <BalInlineInput size="xs" v-model="poolSymbol" inputAlignRight />
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('poolType') }}:</span>
            <span class="text-sm capitalize">{{ poolTypeString }}</span>
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('swapFee') }}:</span>
            <BalStack horizontal spacing="sm">
              <span class="text-sm">{{ fNum(initialFee, 'percent') }}</span>
              <button class="hover:text-blue-500" @click="navigateToPoolFee">
                <BalIcon name="edit" size="xs" />
              </button>
            </BalStack>
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('swapFeeManager') }}:</span>
            <BalStack horizontal spacing="sm">
              <span class="text-sm">{{ getSwapFeeManager() }}</span>
              <button class="hover:text-blue-500" @click="navigateToPoolFee">
                <BalIcon name="edit" size="xs" />
              </button>
            </BalStack>
          </BalStack>
        </BalStack>
      </BalCard>
      <!-- <AnimatePresence
        :isVisible="arbitrageDelta.delta > 0.05"
        unmountInstantly
      >
        <BalAlert
          type="error"
          class="mb-4"
          :title="
            t('createAPool.arbTitle', [
              fNum(arbitrageDelta.value, 'usd'),
              fNum(arbitrageDelta.delta, 'percent')
            ])
          "
        >
          {{ t('createAPool.arbReason') }}
        </BalAlert>
      </AnimatePresence> -->
      <CreateActions
        :tokenAddresses="tokenAddresses"
        :amounts="tokenAmounts"
        @success="handleSuccess"
      />
    </BalStack>
  </BalCard>
</template>
