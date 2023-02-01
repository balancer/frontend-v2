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

  console.log({
    pool,
    tokensIn,
    useNativeAsset,
  });

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

    // For native asset's pool token balance, we use the WETH balance
    const balancesMap = {
      [getAddress(config.network.nativeAsset.address)]: parseUnits(
        weth?.balance || '0',
        weth?.decimals || 18
      ),
    };
    Object.keys(poolTokens.value).forEach(t => {
      balancesMap[getAddress(t)] = parseUnits(
        poolTokens.value[t].balance,
        poolTokens.value[t].decimals || 18
      );
    });

    return balancesMap;
  });

  /**
   * METHODS
   */

  function tokenOf(index: number) {
    return getAddress(tokenAddresses.value[index]);
  }

  function ratioOf(address: string) {
    return poolTokenBalances.value[address];
  }

  /**
   * Calculates proportional amounts in/out given a fixed amount out/in based on
   * the balances and totalSupply of the pool.
   *
   * @param {string} fixedAmount - The fixed amount in/out.
   * @param {number} index - The pool token index for the fixedAmount.
   */
  function propAmountsGiven(
    fixedAmount: string,
    index: number,
    // type: 'send',
    fixedRatioOverride?: {
      bps: number;
      value: string;
      buffer: number;
    }
  ): AmountIn[] {
    if (fixedAmount.trim() === '') return [];

    const fixedTokenAddress = tokenOf(index);
    const fixedToken = tokensIn.value[fixedTokenAddress];
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
        let amount;
        if (fixedRatioOverride) {
          amount = fixedDenormAmount
            .sub(fixedRatioOverride.buffer)
            .mul(fixedRatioOverride.bps)
            .div(10000)
            .mul(ratio)
            .div(fixedRatioOverride.value);
        } else {
          amount = fixedDenormAmount.mul(ratio).div(fixedRatio);
        }
        amounts[i].value = formatUnits(amount, token?.decimals);
      }
    });

    return amounts;
  }

  function getPropMax(): AmountIn[] {
    // if (!tokenAddresses.value.length) return [];
    let maxAmounts: AmountIn[] = tokenAddresses.value.map(address => {
      return {
        address,
        valid: true,
        value: '0',
      };
    });

    tokenAddresses.value.forEach((token, tokenIndex) => {
      let hasBalance = true;
      let balance;
      if (isSameAddress(token, config.network.nativeAsset.address)) {
        balance = bnum(balances.value[getAddress(token)])
          .minus(config.network.nativeAsset.minTransactionBuffer)
          .toString();
      } else {
        balance = balances.value[getAddress(token)] || '0';
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
    console.log({ maxAmounts });
    return maxAmounts;
  }

  return { getPropMax };
}
