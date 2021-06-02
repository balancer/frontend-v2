<script lang="ts">
import {
  defineComponent,
  onBeforeMount,
  provide,
  reactive,
  readonly,
  ref,
  toRefs
} from 'vue';
import Onboard from 'bnc-onboard';
import Web3 from 'web3';
import { Web3State, Web3ProviderSymbol } from '@/composables/useOnboard';

export default defineComponent({
  setup() {
    const web3State = reactive<Web3State>({
      onboardInstance: ref(null),
      web3Instance: ref(null)
    });

    onBeforeMount(() => {
      web3State.onboardInstance = Onboard({
        dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID,
        networkId: Number(process.env.VUE_APP_NETWORK),
        subscriptions: {
          wallet: wallet => {
            web3State.web3Instance = new Web3(wallet.provider);
          }
        }
      });
    });

    provide(Web3ProviderSymbol, toRefs(readonly(web3State)));
  },
  render() {
    // @ts-ignore
    return this.$slots.default();
  }
});
</script>
