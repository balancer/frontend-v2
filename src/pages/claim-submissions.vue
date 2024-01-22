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
const claimsNetwork = Network.MAINNET;
const networkOptions: NetworkOption[] = Object.values(config)
  .filter(
    config =>
      (config.visibleInUI || config.chainId === Network.OPTIMISM) &&
      !config.testNetwork
  )
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
      <h1 class="mb-2">Claim Submission</h1>
      <p class="mb-4 max-w-3xl">
        This tool was created to facilitate user claim submissions resulting
        from the exploit described
        <a
          class="link"
          href="https://medium.com/immunefi/balancer-rounding-error-bugfix-review-cbf69482ee3d"
          target="_blank"
          >here</a
        >.
      </p>
      <p class="mb-4 max-w-3xl">
        In order to calculate the value of your unrecoverable assets, please
        <a
          class="link"
          href="https://app.balancer.fi/#/ethereum/recovery-exit"
          target="_blank"
          >withdraw from the affected liquidity pools</a
        >
        and report the withdrawal transaction hash below. The withdrawal needs
        to take place after the first incident occurred; block 18004633
        (ethereum) or block 108777562 (optimism).
      </p>

      <p class="mb-4 max-w-3xl">
        If you had positions in multiple pools, report multiple withdrawal
        transaction hashes. If you withdrew partially, report those transactions
        too. Please file a new report for every chain.
      </p>

      <p class="max-w-3xl font-bold">
        Note that the claims period is now closed.
      </p>

      <div v-if="wrongNetwork" class="mt-8">
        <p class="mb-2">
          Claim submission are only accepted on
          {{ getNetworkName(Network.MAINNET) }}
        </p>
        <BalBtn
          tag="router-link"
          :to="{
            name: 'claim-submission',
            params: { networkSlug: getNetworkSlug(Network.MAINNET) },
          }"
          color="gradient"
          size="sm"
          >Claim on Ethereum Mainnet</BalBtn
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
                disabled
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
                    disabled
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
            disabled
            @confirmed="clearForm()"
          />
          <BalBtn
            v-else
            color="gradient"
            size="sm"
            disabled
            @click="startConnectWithInjectedProvider"
            >Connect wallet</BalBtn
          >
        </BalVStack>
      </BalCard>
    </BalVStack>
  </BalContainer>
</template>
