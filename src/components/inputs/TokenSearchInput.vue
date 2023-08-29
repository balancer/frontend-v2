<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { compact } from 'lodash';
import { ref } from 'vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useVeBal from '@/composables/useVeBAL';
import {
  NATIVE_ASSET_ADDRESS,
  WRAPPED_NATIVE_ASSET_ADDRESS,
} from '@/constants/tokens';
import useBreakpoints from '@/composables/useBreakpoints';

type Props = {
  modelValue: string[];
};

withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits<{
  (e: 'add', token: string): void;
  (e: 'remove', token: string): void;
}>();

/**
 * STATE
 */
const selectTokenModal = ref(false);

/**
 * COMPOSABLES
 */
const { veBalTokenInfo } = useVeBal();
const { upToMediumBreakpoint } = useBreakpoints();

/**
 * METHODS
 */
function addToken(token: string) {
  let _token = token;
  // special case for the native asset where we want it to filter as
  // wrapped native asset regardless as the native asset can't be in pools
  if (getAddress(token) === NATIVE_ASSET_ADDRESS) {
    _token = WRAPPED_NATIVE_ASSET_ADDRESS;
  }
  emit('add', _token);
}

function onClick() {
  selectTokenModal.value = true;
}
</script>
<template>
  <div>
    <div class="flex flex-wrap gap-x-6 gap-y-3 items-stretch">
      <BalBtn
        color="white"
        size="sm"
        :block="upToMediumBreakpoint"
        justifyContent="between"
        @click="onClick"
      >
        <BalIcon name="search" size="sm" class="mr-2" />
        {{ $t('filterByToken') }}
      </BalBtn>
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        v-if="selectTokenModal"
        :excludedTokens="compact([...modelValue, veBalTokenInfo?.address])"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>
