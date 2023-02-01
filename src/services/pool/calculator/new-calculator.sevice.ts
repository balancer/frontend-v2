import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits, parseUnits } from '@ethersproject/units';
// import OldBigNumber from 'bignumber.js';
import { Ref, ref } from 'vue';

// import {
// isComposableStableLike,
// isDeep,
// isStable,
// isStableLike,
//   tokensListExclBpt,
// } from '@/composables/usePool';
import { bnum, isSameAddress, selectByAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { OnchainTokenDataMap, Pool } from '@/services/pool/types';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { TokenInfoMap } from '@/types/TokenList';
import { AmountIn } from '@/providers/local/join-pool.provider';

export default class NewCalculatorService {
  constructor(
    public pool: Ref<Pool>,
    public tokensIn: Ref<TokenInfoMap>,
    public balances: Ref<BalanceMap>,
    public useNativeAsset: Ref<boolean> = ref(false),

    public readonly config = configService
  ) {}

  public propMax(): AmountIn[] {
    let maxAmounts: AmountIn[] = Object.keys(this.tokensIn.value).map(
      address => {
        return {
          address,
          valid: true,
          value: '0',
        };
      }
    );

    this.tokenAddresses.forEach((token, tokenIndex) => {
      let hasBalance = true;
      let balance;
      if (isSameAddress(token, this.config.network.nativeAsset.address)) {
        balance = bnum(this.balances.value[getAddress(token)])
          .minus(this.config.network.nativeAsset.minTransactionBuffer)
          .toString();
      } else {
        balance = this.balances.value[getAddress(token)] || '0';
      }
      const amounts: AmountIn[] = this.propAmountsGiven(balance, tokenIndex);

      amounts.forEach((amount, amountIndex) => {
        const greaterThanBalance = bnum(amount.value).gt(
          this.balances.value[this.tokenOf(amountIndex)]
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
          // fixedTokenIndex = tokenIndex;
        }
      }
    });

    return maxAmounts;
  }

  /**
   * Calculates proportional amounts in/out given a fixed amount out/in based on
   * the balances and totalSupply of the pool.
   *
   * @param {string} fixedAmount - The fixed amount in/out.
   * @param {number} index - The pool token index for the fixedAmount.
   */
  public propAmountsGiven(
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

    // const types = ['send'];
    const fixedTokenAddress = this.tokenOf(index);
    const fixedToken = this.tokensIn.value[fixedTokenAddress];
    const fixedDenormAmount = parseUnits(fixedAmount, fixedToken?.decimals);
    const fixedRatio = this.ratioOf(fixedTokenAddress);
    const amounts: AmountIn[] = this.tokenAddresses.map(token => {
      return {
        address: token,
        valid: true,
        value: '0',
      };
    });

    amounts[index].value = fixedAmount;

    Object.values(this.tokensIn.value).forEach((token, i) => {
      const ratio = this.ratioOf(token.address);
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

  public tokenOf(index: number) {
    return getAddress(this.tokenAddresses[index]);
  }

  public ratioOf(address: string) {
    return this.poolTokenBalances[address];
  }

  public get tokenAddresses(): string[] {
    const tokensList = Object.keys(this.tokensIn.value);
    if (this.useNativeAsset.value) {
      return tokensList.map(address => {
        if (isSameAddress(address, this.config.network.addresses.weth))
          return this.config.network.nativeAsset.address;
        return address;
      });
    }

    return tokensList;
  }

  public get poolTokens(): OnchainTokenDataMap {
    if (!this.pool.value?.onchain?.tokens) return {};

    return this.pool.value.onchain.tokens;
  }

  public get poolTokenBalances(): Record<string, BigNumber> {
    if (!this.pool.value?.onchain?.tokens) return {};
    const weth = selectByAddress(
      this.poolTokens,
      this.config.network.addresses.weth
    );

    // For native asset's pool token balance, we use the WETH balance
    const balancesMap = {
      [getAddress(this.config.network.nativeAsset.address)]: parseUnits(
        weth?.balance || '0',
        weth?.decimals || 18
      ),
    };
    Object.keys(this.poolTokens).forEach(t => {
      balancesMap[getAddress(t)] = parseUnits(
        this.poolTokens[t].balance,
        this.poolTokens[t].decimals || 18
      );
    });

    return balancesMap;
  }

  public get poolTokenWeights(): BigNumber[] {
    const normalizedWeights = Object.values(this.poolTokens).map(t => t.weight);
    return normalizedWeights.map(weight => parseUnits(weight.toString(), 18));
  }

  public get poolTotalSupply(): BigNumber {
    return parseUnits(
      this.pool.value?.onchain?.totalSupply || '0',
      this.poolDecimals
    );
  }

  public get poolDecimals(): number {
    return this.pool.value?.onchain?.decimals || 18;
  }
}
