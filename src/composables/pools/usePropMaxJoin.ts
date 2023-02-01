import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { computed, ref, Ref } from 'vue';
import { bnum, isSameAddress, selectByAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { OnchainTokenDataMap, Pool } from '@/services/pool/types';
import { TokenInfoMap } from '@/types/TokenList';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { useTokens } from '@/providers/tokens.provider';

// TODO: Don't get by index, get by address

export default function usePropMaxJoin(
  pool: Pool,
  tokensIn: Ref<TokenInfoMap>,
  useNativeAsset: Ref<boolean> = ref(false)
) {
  const config = configService;

  /**
   * COMPOSABLES
   */
  const { balances } = useTokens();

  /**
   * COMPUTED
   */
  const tokenAddresses = computed((): string[] => {
    const tokensList = Object.keys(tokensIn.value);
    if (useNativeAsset.value) {
      return tokensList.map(address => {
        if (isSameAddress(address, config.network.addresses.weth))
          return config.network.nativeAsset.address;
        return address;
      });
    }
    return tokensList;
  });

  const poolTokens = computed((): OnchainTokenDataMap => {
    if (!pool.onchain?.tokens) return {};
    return pool.onchain.tokens;
  });

  const poolTokenBalances = computed((): Record<string, BigNumber> => {
    if (!pool.onchain?.tokens) return {};
    const weth = selectByAddress(
      poolTokens.value,
      config.network.addresses.weth
    );

    // Set pool native asset balance to be the same as its WETH balance
    const balancesMap = {
      [config.network.nativeAsset.address]: parseUnits(
        weth?.balance || '0',
        weth?.decimals || 18
      ),
    };

    Object.keys(poolTokens.value).forEach(item => {
      const address = getAddress(item);
      const poolToken = selectByAddress(poolTokens.value, address);
      if (poolToken) {
        balancesMap[address] = parseUnits(
          poolToken.balance,
          poolToken.decimals || 18
        );
      }
    });

    return balancesMap;
  });

  /**
   * METHODS
   */

  function tokenOf(index: number) {
    return getAddress(tokenAddresses.value[index]);
  }

  function ratioOf(address: string): BigNumber {
    const poolBalance = selectByAddress(poolTokenBalances.value, address);
    if (!poolBalance) {
      throw new Error(
        `Balance for token: ${address} was not found in pool token balances`
      );
    }
    return poolBalance;
  }

  /**
   * Calculates proportional amounts in/out given a fixed amount out/in based on
   * the balances and totalSupply of the pool.
   *
   * @param {string} fixedAmount - The fixed amount in/out.
   * @param {number} index - The pool token index for the fixedAmount.
   */
  function propAmountsGiven(fixedAmount: string, index: number): AmountIn[] {
    if (fixedAmount.trim() === '') return [];

    const fixedTokenAddress = tokenOf(index);
    const fixedToken = selectByAddress(tokensIn.value, fixedTokenAddress);
    const fixedDenormAmount = parseUnits(fixedAmount, fixedToken?.decimals);
    const fixedRatio = ratioOf(fixedTokenAddress);
    const amounts: AmountIn[] = tokenAddresses.value.map(token => {
      return {
        address: token,
        valid: true,
        value: '0',
      };
    });

    amounts[index].value = fixedAmount;

    Object.values(tokensIn.value).forEach((token, i) => {
      const ratio = ratioOf(token.address);
      if (i !== index) {
        const amount = fixedDenormAmount.mul(ratio).div(fixedRatio);
        amounts[i].value = formatUnits(amount, token?.decimals);
      }
    });

    return amounts;
  }

  function getPropMax(): AmountIn[] {
    let maxAmounts: AmountIn[] = tokenAddresses.value.map(address => {
      return {
        address,
        valid: true,
        value: '0',
      };
    });

    tokenAddresses.value.forEach((token, tokenIndex) => {
      let hasBalance = true;
      let balance: string;
      if (isSameAddress(token, config.network.nativeAsset.address)) {
        const _balance = selectByAddress(balances.value, token);
        balance = _balance
          ? bnum(_balance)
              .minus(config.network.nativeAsset.minTransactionBuffer)
              .toString()
          : '0';
      } else {
        balance = selectByAddress(balances.value, token) || '0';
      }
      const amounts: AmountIn[] = propAmountsGiven(balance, tokenIndex);

      amounts.forEach((amount, amountIndex) => {
        const greaterThanBalance = bnum(amount.value).gt(
          balances.value[tokenOf(amountIndex)]
        );
        if (greaterThanBalance) hasBalance = false;
      });

      if (hasBalance) {
        const currentMaxAmount = parseFloat(
          maxAmounts[tokenIndex].value || '0'
        );
        const thisAmount = parseFloat(amounts[tokenIndex].value);
        if (thisAmount > currentMaxAmount) {
          maxAmounts = amounts;
        }
      }
    });

    return maxAmounts;
  }

  return { getPropMax };
}
