export default class Adapter {
  public tokens;
  public sendTokens: string[];
  public receiveTokens: string[];
  public sendRatios: string[];
  public receiveRatios: string[];

  constructor(tokens, sendTokens, receiveTokens, sendRatios, receiveRatios) {
    this.tokens = tokens;
    this.sendTokens = sendTokens;
    this.receiveTokens = receiveTokens;
    this.sendRatios = sendRatios;
    this.receiveRatios = receiveRatios;
  }
}
