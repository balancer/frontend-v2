<script lang="ts" setup>
import { Config, Network } from '@/lib/config/types';
import { shorten } from '@/lib/utils';
import { isRequired, isTxHash } from '@/lib/utils/validations';
import config from '@/lib/config';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { configService } from '@/services/config/config.service';
import {
  networkId,
  getNetworkSlug,
  getNetworkName,
} from '@/composables/useNetwork';

/**
 * TYPES
 */
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
const claimsNetwork = Network.POLYGON;
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
const {
  account,
  getSigner,
  startConnectWithInjectedProvider,
  isMismatchedNetwork,
} = useWeb3();

/**
 * COMPUTED
 */
const wrongNetwork = computed(() => networkId.value !== claimsNetwork);

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

async function submitClaim() {
  const signer = getSigner();
  const contractAddress = configService.network.addresses.claimSubmission;
  if (!contractAddress) throw new Error('No contract address found');

  const txBuilder = new TransactionBuilder(signer);

  return txBuilder.contract.sendTransaction({
    contractAddress: contractAddress,
    abi: ['function submitClaim(string memory network, bytes32 txHash) public'],
    action: 'submitClaim',
    params: [form.network.toString(), form.txHash],
  });
}
</script>

<template>
  <BalContainer>
    <BalVStack>
      <h1>Restitutions</h1>
      <p>Some blurb...</p>

      <div v-if="wrongNetwork" class="mt-8">
        <p class="mb-2">
          Claim submission are only accepted on
          {{ getNetworkName(Network.POLYGON) }}
        </p>
        <BalBtn
          tag="router-link"
          :to="{
            name: 'restitutions',
            params: { networkSlug: getNetworkSlug(Network.POLYGON) },
          }"
          color="gradient"
          size="sm"
          >Claim on Polygon</BalBtn
        >
      </div>

      <BalCard v-else class="mt-8 max-w-lg">
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
          <BalAlert
            v-if="isMismatchedNetwork"
            title="Wrong network"
            description="Your wallet is connected to the wrong network."
            type="warning"
            class="mb-4"
          />
          <TxActionBtn
            v-if="account"
            label="Submit claim"
            color="gradient"
            size="sm"
            :actionFn="submitClaim"
            action="claimSubmission"
            :summary="`Claim submission: ${shorten(form.txHash)}`"
            :confirmingLabel="`Submitting...`"
            :disabled="!form.valid || !form.txHash || isMismatchedNetwork"
            @confirmed="clearForm()"
          />
          <BalBtn
            v-else
            color="gradient"
            size="sm"
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
        </BalVStack>
      </BalCard>
    </BalVStack>
  </BalContainer>
</template>
