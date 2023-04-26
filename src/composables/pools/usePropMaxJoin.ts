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

export default function usePropMaxJoin(
  pool: Pool,
  tokensIn: Ref<TokenInfoMap>,
  useNativeAsset: Ref<boolean> = ref(false)
) {
  const config = configService;

  /**
   * COMPOSABLES
   */
  const { balanceFor } = useTokens();

  /**
   * COMPUTED
   */
  const tokenAddresses = computed((): string[] => {
    const tokensList = Object.keys(tokensIn.value);
    if (useNativeAsset.value) {
      return tokensList.map(address => {
        if (
          isSameAddress(address, config.network.tokens.Addresses.wNativeAsset)
        )
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

    const wNativeAsset = selectByAddress(
      poolTokens.value,
      config.network.tokens.Addresses.wNativeAsset
    );

    // Set pool native asset balance to be the same as its WETH balance
    const balancesMap = {
      [config.network.nativeAsset.address]: parseUnits(
        wNativeAsset?.balance || '0',
        wNativeAsset?.decimals || 18
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

  /**
   * Calculates the proportional amount for a pool token given a fixed amount of
   * another pool token.
   *
   * @param {string} address - The address of the token to calculate the
   * proportional amount for.
   * @param {AmountIn} fixedAmountIn - The fixed amount in.
   * @returns {string} - The proportional amount.
   */
  function calcProportionalValue(
    address: string,
    fixedAmountIn: AmountIn
  ): string {
    if (isSameAddress(address, fixedAmountIn.address))
      return fixedAmountIn.value;

    // Token to calculate proportional amount for
    const token = selectByAddress(tokensIn.value, address);
    const poolTokenBalance =
      selectByAddress(poolTokenBalances.value, address) || parseUnits('0');

    // Token with fixed amount
    const fixedTokenData = selectByAddress(
      tokensIn.value,
      fixedAmountIn.address
    );
    const evmFixedAmount = parseUnits(
      fixedAmountIn.value,
      fixedTokenData?.decimals
    );
    const fixedTokenPoolBalance =
      selectByAddress(poolTokenBalances.value, fixedAmountIn.address) ||
      parseUnits('0');

    const amount = evmFixedAmount
      .mul(poolTokenBalance)
      .div(fixedTokenPoolBalance);
    return formatUnits(amount, token?.decimals);
  }

  /**
   * Calculates proportional amounts in given a fixed amount of one of the input
   * tokens and the balances of the pool tokens in the pool.
   *
   * @param {string} fixedAmount - The fixed amount in.
   * @param {number} index - The pool token index for the fixedAmount.
   */
  function propAmountsGiven(amountIn: AmountIn): AmountIn[] {
    if (amountIn.value.trim() === '') return [];

    return tokenAddresses.value.map(address => {
      return {
        address,
        valid: true,
        value: calcProportionalValue(address, amountIn),
      };
    });
  }

  /**
   * Calculates the proportional maximum amounts in given the user's token balances.
   * i.e. it finds the limiting token balance and uses it to calculate the
   * proportional amounts for the other tokens.
   *
   * @returns {AmountIn[]} - The proportional maximum amounts.
   */
  function getPropMax(): AmountIn[] {
    let maxAmounts: AmountIn[] = tokenAddresses.value.map(address => {
      return {
        address,
        valid: true,
        value: '0',
      };
    });

    tokenAddresses.value.forEach(address => {
      let hasBalance = true;
      let balance: string;

      // Fetch balance for current token, subtracting a buffer for gas if it's the
      // native token.
      if (isSameAddress(address, config.network.nativeAsset.address)) {
        const _balance = balanceFor(address);
        balance = _balance
          ? bnum(_balance)
              .minus(config.network.nativeAsset.minTransactionBuffer)
              .toString()
          : '0';
      } else {
        balance = balanceFor(address);
      }

      // Calculate proportional amounts of the other tokens given the current
      // token as the fixed amount.
      const proportionalAmountsIn: AmountIn[] = propAmountsGiven({
        address,
        value: balance,
        valid: true,
      });

      // Check if for the calculated proportional amounts, the user has a
      // sufficient balance. If not, set hasBalance to false.
      proportionalAmountsIn.forEach(proportionalAmountIn => {
        const greaterThanBalance = bnum(proportionalAmountIn.value).gt(
          balanceFor(proportionalAmountIn.address)
        );
        if (greaterThanBalance) hasBalance = false;
      });

      // If the user has a sufficient balance inject the amount into the
      // maxAmounts array.
      if (hasBalance) {
        const currentMaxAmount =
          maxAmounts.find(amountIn => isSameAddress(amountIn.address, address))
            ?.value || '0';
        const thisAmount =
          proportionalAmountsIn.find(amountIn =>
            isSameAddress(amountIn.address, address)
          )?.value || '0';

        if (bnum(thisAmount).gt(currentMaxAmount)) {
          maxAmounts = proportionalAmountsIn;
        }
      }
    });

    return maxAmounts;
  }

  return { getPropMax };
}
