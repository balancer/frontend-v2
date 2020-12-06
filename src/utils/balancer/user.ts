export default class User {
  public address: string;
  public balances: any = {};
  public allowances: any = {};

  constructor(address) {
    this.address = address;
  }
}
