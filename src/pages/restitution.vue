<script lang="ts" setup>
import useDarkMode from '@/composables/useDarkMode';
import { Config, Network } from '@/lib/config/types';
import { shorten } from '@/lib/utils';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { isRequired, isTxHash } from '@/lib/utils/validations';
import config from '@/lib/config';

/**
 * TYPES
 */
type Claim = {
  network: Network;
  txHash: string;
};

type Form = {
  network: Network;
  txHash: string;
  valid: boolean;
};

type NetworkOption = {
  text: string;
  value: Network;
};

/**
 * STATE
 */
const claims = ref<Claim[]>([]);

const networkOptions: NetworkOption[] = Object.values(config)
  .filter(config => config.visibleInUI && !config.testNetwork)
  .map(convertConfigToNetworkOption);

const form = reactive<Form>({
  network: networkOptions[0].value,
  txHash: '',
  valid: true,
});

/**
 * COMPOSABLES
 */
const { darkMode } = useDarkMode();

/**
 * METHODS
 */
function convertConfigToNetworkOption(config: Config): NetworkOption {
  return {
    text: config.chainName,
    value: config.chainId,
  };
}

function clearForm() {
  form.network = networkOptions[0].value;
  form.txHash = '';
  form.valid = true;
}

function addClaim() {
  claims.value.push({ network: form.network, txHash: form.txHash });
  clearForm();
}

function removeClaim(index: number) {
  claims.value.splice(index, 1);
}

function submitClaims() {
  console.log('submit claims', claims.value);
}
</script>

<template>
  <BalContainer>
    <BalVStack>
      <h1>Restitutions</h1>
      <p>Some blurb...</p>

      <BalCard class="mt-8 max-w-lg">
        <BalVStack>
          <BalHStack spacing="sm">
            <div>
              <BalText>Network</BalText>
              <BalSelectInput
                v-model="form.network"
                name="network"
                :options="networkOptions"
                class="w-32 h-11"
              />
            </div>

            <div class="w-full">
              <BalText>Transaction hash</BalText>
              <BalTextInput
                v-model="form.txHash"
                v-model:isValid="form.valid"
                name="txHash"
                size="sm"
                placeholder="0x..."
                :rules="[isRequired(), isTxHash()]"
              />
            </div>
          </BalHStack>
          <BalBtn
            size="sm"
            class="mt-1 h-11"
            outline
            color="blue"
            :disabled="!form.valid || !form.txHash"
            @click="addClaim"
          >
            Add claim
          </BalBtn>
        </BalVStack>
      </BalCard>

      <BalVStack maxWidth="lg" spacing="md" class="mt-8">
        <BalText as="h3">Claims</BalText>
        <BalHStack
          v-for="(claim, i) in claims"
          :key="i"
          spacing="md"
          justify="between"
          align="center"
        >
          <BalHStack spacing="md" align="center">
            <img
              :src="buildNetworkIconURL(claim.network as Network)"
              class="w-5 h-5"
            />
            <BalText>{{ shorten(claim.txHash) }}</BalText>
          </BalHStack>
          <BalBtn
            size="xs"
            outline
            :color="darkMode ? 'gray' : 'black'"
            @click="removeClaim(i)"
            >Remove</BalBtn
          >
        </BalHStack>
        <BalBlankSlate v-if="claims.length === 0" align="center"
          ><BalText class="text-gray-500" size="sm"
            >No claims</BalText
          ></BalBlankSlate
        >
        <div>
          <BalBtn
            :disabled="claims.length === 0"
            color="gradient"
            size="sm"
            @click="submitClaims"
            >Submit claims</BalBtn
          >
        </div>
      </BalVStack>
    </BalVStack>
  </BalContainer>
</template>
