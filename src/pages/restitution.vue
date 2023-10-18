<script lang="ts" setup>
import { Config, Network } from '@/lib/config/types';
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
  txHashes: string[];
  valid: boolean[];
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
  txHashes: [''],
  valid: [true],
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

const formValid = computed(() => {
  return form.txHashes.every((txHash, index) => {
    return form.valid[index];
  });
});

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
  form.txHashes = [''];
  form.valid = [true];
}

function addHash() {
  form.txHashes.push('');
}

function removeHash(index) {
  form.txHashes.splice(index, 1);
}

function uniqueTxHash(hashes: string[]) {
  return v =>
    !v || hashes.filter(h => h === v).length <= 1 || 'Duplicate transaction';
}

async function submitClaim() {
  const signer = getSigner();
  const contractAddress = configService.network.addresses.claimSubmission;
  if (!contractAddress) throw new Error('No contract address found');

  const txBuilder = new TransactionBuilder(signer);

  return txBuilder.contract.sendTransaction({
    contractAddress: contractAddress,
    abi: [
      'function submitClaim(string memory network, bytes32[] memory txHashes) public',
    ],
    action: 'submitClaim',
    params: [form.network.toString(), form.txHashes],
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

      <BalCard v-else class="mt-8 max-w-lg" title="Claim submission form">
        <BalVStack spacing="md">
          <BalVStack>
            <div>
              <BalText>Network</BalText>
              <BalSelectInput
                v-model="form.network"
                name="network"
                :options="networkOptions"
                class="w-32 h-11"
              />
            </div>

            <div>
              <BalText>Transaction hashes</BalText>
              <BalVStack spacing="sm">
                <BalHStack
                  v-for="(_, index) in form.txHashes"
                  :key="index"
                  width="full"
                  spacing="sm"
                  align="center"
                >
                  <BalTextInput
                    v-model="form.txHashes[index]"
                    v-model:isValid="form.valid[index]"
                    name="txHash"
                    size="sm"
                    placeholder="0x..."
                    :rules="[
                      isRequired(),
                      isTxHash(),
                      uniqueTxHash(form.txHashes),
                    ]"
                    class="w-full"
                  />
                  <BalBtn
                    v-if="index === form.txHashes.length - 1"
                    size="sm"
                    outline
                    square
                    color="blue"
                    :disabled="
                      !formValid ||
                      form.txHashes[index] === '' ||
                      form.txHashes.length >= 10
                    "
                    @click="addHash"
                    ><BalIcon name="plus"
                  /></BalBtn>
                  <BalBtn
                    v-else
                    size="sm"
                    outline
                    square
                    color="gray"
                    @click="removeHash(index)"
                    ><BalIcon name="minus"
                  /></BalBtn>
                </BalHStack>
              </BalVStack>
            </div>
          </BalVStack>
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
            :summary="`Claim submission: ${form.txHashes.length} tx(s)`"
            :confirmingLabel="`Submitting...`"
            :disabled="
              !formValid || form.txHashes.length === 0 || isMismatchedNetwork
            "
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
