import { formatUnits, parseUnits } from '@ethersproject/units';
import Adapter from '@/utils/balancer/adapters/adapter';

export default class PoolAdapter extends Adapter {
  calcAmountsWith(type, index, currentAmount) {
    if (currentAmount.trim() === '')
      return {
        sendAmounts: [],
        receiveAmounts: []
      };

    const types = ['send', 'receive'];
    const amounts = {
      send: this.sendTokens.map(() => ''),
      receive: this.receiveTokens.map(() => '')
    };
    const currentTokenAddress = this[`${type}Tokens`][index];
    const currentToken = this.tokens[currentTokenAddress];
    const currentDenormAmount = parseUnits(
      currentAmount,
      currentToken.decimals
    );
    const currentRatio = this[`${type}Ratios`][index];
    amounts[type][index] = currentAmount;

    [this.sendRatios, this.receiveRatios].forEach((ratios, ratioType) => {
      ratios.forEach((ratio, i) => {
        if (i !== index || type !== types[ratioType]) {
          const tokenAddress = this[`${types[ratioType]}Tokens`][i];
          const token = this.tokens[tokenAddress];
          amounts[types[ratioType]][i] = formatUnits(
            currentDenormAmount.mul(ratio).div(currentRatio),
            token.decimals
          );
        }
      });
    });

    return {
      sendAmounts: amounts.send,
      receiveAmounts: amounts.receive
    };
  }
}
