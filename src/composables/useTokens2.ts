import { ref, computed } from 'vue';
import useTokenLists2 from './useTokenLists2';
import { getAddress } from '@ethersproject/address';
import { TokenInfo } from '@/types/TokenList';
import useConfig from './useConfig';
import { tokenService } from '@/services/token/token.service';
import useTokenPricesQuery from './queries/useTokenPricesQuery';
import useAccountBalancesQuery from './queries/useAccountBalancesQuery';
import useAccountAllowancesQuery from './queries/useAccountAllowancesQuery';
import { configService } from '@/services/config/config.service';

// TYPES
type TokenMap = { [address: string]: TokenInfo };

// STATE
const injectedTokens = ref<TokenMap>({});
const allowanceContracts = ref<string[]>([]);

// INIT STATE
allowanceContracts.value.push(configService.network.addresses.vault);

export default function useTokens2() {
  // COMPOSABLES
  const { networkConfig } = useConfig();
  const {
    loading: loadingTokenLists,
    failed: tokenListsFailed,
    defaultTokenList: tokenList,
    all: allTokenLists
  } = useTokenLists2();

  // COMPUTED
  /**
   * Static metadata
   *
   * The baseTokens, injectedTokens and allTokens dictionaries
   * provide the static metadata for each token.
   */
  const baseTokens = computed(
    (): TokenMap => {
      if (loadingTokenLists.value || tokenListsFailed.value) return {};

      const baseTokens = {};

      tokenList.value.tokens.forEach(token => {
        const address: string = getAddress(token.address);
        // Don't include if already included
        if (Object.keys(baseTokens).includes(address)) return;
        // Don't include if not on app network
        if (token.chainId !== networkConfig.chainId) return;

        baseTokens[address] = {
          ...token,
          address
        };
      });

      return baseTokens;
    }
  );

  const ether = computed(
    (): TokenMap => {
      return {
        [networkConfig.nativeAsset.address]: {
          ...networkConfig.nativeAsset,
          chainId: networkConfig.chainId
        }
      };
    }
  );

  const allTokens = computed(
    (): TokenMap => {
      return {
        ...baseTokens.value,
        ...injectedTokens.value
      };
    }
  );

  const allTokenAddresses = computed(() => Object.keys(allTokens.value));

  /**
   * Dynamic metadata
   *
   * The prices, balances and allowances maps provide dynamic
   * metadata for each token in allTokens.
   */
  const pricesQuery = useTokenPricesQuery(allTokenAddresses);
  const accountBalancesQuery = useAccountBalancesQuery(allTokenAddresses);
  const accountAllowancesQuery = useAccountAllowancesQuery(
    allTokenAddresses,
    allowanceContracts
  );

  const prices = computed(() =>
    pricesQuery.data.value ? pricesQuery.data.value : {}
  );
  const balances = computed(() =>
    accountBalancesQuery.data.value ? accountBalancesQuery.data.value : {}
  );
  const allowances = computed(() =>
    accountAllowancesQuery.data.value ? accountAllowancesQuery.data.value : {}
  );

  // METHODS
  async function injectTokens(addresses: string[]): Promise<void> {
    const tokens = await tokenService.metadata.get(
      addresses,
      allTokenLists.value
    );
    injectedTokens.value = { ...injectedTokens.value, ...tokens };
  }

  /**
   * Adds contract address to array of contract addresses used to
   * track ERC20 allowances.
   */
  function addAllowanceContract(address: string): void {
    allowanceContracts.value.push(address);
  }

  return {
    // computed
    allTokens,
    ether,
    prices,
    balances,
    allowances,
    // methods
    injectTokens,
    addAllowanceContract
  };
}
